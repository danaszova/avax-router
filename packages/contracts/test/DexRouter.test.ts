import { expect } from "chai";
import { ethers } from "hardhat";
import { DexRouter, MockERC20, MockDexAdapter } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DexRouter", function () {
    let dexRouter: DexRouter;
    let mockTokenA: MockERC20;
    let mockTokenB: MockERC20;
    let adapter1: MockDexAdapter;
    let adapter2: MockDexAdapter;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let otherAccount: SignerWithAddress;

    const FEE_BPS = 5;
    const BPS_DENOMINATOR = 10000;

    beforeEach(async function () {
        [owner, user, otherAccount] = await ethers.getSigners();

        // Deploy Mock Tokens
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        mockTokenA = await MockERC20Factory.deploy("Token A", "TKNA", ethers.parseEther("10000"));
        mockTokenB = await MockERC20Factory.deploy("Token B", "TKNB", ethers.parseEther("10000"));

        // Deploy Mock Adapters
        const MockDexAdapterFactory = await ethers.getContractFactory("MockDexAdapter");
        adapter1 = await MockDexAdapterFactory.deploy();
        adapter2 = await MockDexAdapterFactory.deploy();

        // Deploy DexRouter
        const DexRouterFactory = await ethers.getContractFactory("DexRouter");
        dexRouter = await DexRouterFactory.deploy(); // Owner is set to msg.sender by default

        // Mint tokens to user
        await mockTokenA.mint(user.address, ethers.parseEther("1000"));

        // Mint tokens to adapters so they can fulfill swaps
        await mockTokenB.mint(await adapter1.getAddress(), ethers.parseEther("10000"));
        await mockTokenB.mint(await adapter2.getAddress(), ethers.parseEther("10000"));
    });

    describe("Core Functionality", function () {
        it("Should set the right owner", async function () {
            expect(await dexRouter.owner()).to.equal(owner.address);
        });

        it("Should register an adapter", async function () {
            await dexRouter.registerAdapter("DEX1", await adapter1.getAddress());
            expect(await dexRouter.adapters("DEX1")).to.equal(await adapter1.getAddress());

            const registeredDexes = await dexRouter.getRegisteredDexes();
            expect(registeredDexes).to.include("DEX1");
        });

        it("Should remove an adapter", async function () {
            await dexRouter.registerAdapter("DEX1", await adapter1.getAddress());
            await dexRouter.removeAdapter("DEX1");

            expect(await dexRouter.adapters("DEX1")).to.equal(ethers.ZeroAddress);
            const registeredDexes = await dexRouter.getRegisteredDexes();
            expect(registeredDexes).to.not.include("DEX1");
        });

        it("Should prevent non-owner from registering adapter", async function () {
            await expect(
                dexRouter.connect(otherAccount).registerAdapter("DEX1", await adapter1.getAddress())
            ).to.be.revertedWithCustomError(dexRouter, "OwnableUnauthorizedAccount");
        });
    });

    describe("Fee Collection & Management", function () {
        const amountIn = ethers.parseEther("100");

        beforeEach(async function () {
            await dexRouter.registerAdapter("DEX1", await adapter1.getAddress());
        });

        it("Should verify 0.05% fee rate", async function () {
            expect(await dexRouter.FEE_BPS()).to.equal(5);
        });

        it("Should accumulate fees ensuring router balance increases", async function () {
            // User approves router
            await mockTokenA.connect(user).approve(await dexRouter.getAddress(), amountIn);

            // Execute swap
            await dexRouter.connect(user).swapOnDex(
                "DEX1",
                await mockTokenA.getAddress(),
                await mockTokenB.getAddress(),
                amountIn,
                0,
                user.address
            );

            // Calculate expected fee
            const fee = (amountIn * BigInt(FEE_BPS)) / BigInt(BPS_DENOMINATOR);

            // Router should hold the fee
            expect(await mockTokenA.balanceOf(await dexRouter.getAddress())).to.equal(fee);
        });

        it("Should allow owner to withdraw fees", async function () {
            // Accumulate some fees first
            await mockTokenA.connect(user).approve(await dexRouter.getAddress(), amountIn);
            await dexRouter.connect(user).swapOnDex(
                "DEX1",
                await mockTokenA.getAddress(),
                await mockTokenB.getAddress(),
                amountIn,
                0,
                user.address
            );

            const fee = (amountIn * BigInt(FEE_BPS)) / BigInt(BPS_DENOMINATOR);
            const initialOwnerBalance = await mockTokenA.balanceOf(owner.address);

            await dexRouter.withdrawFees(await mockTokenA.getAddress(), fee, owner.address);

            expect(await mockTokenA.balanceOf(owner.address)).to.equal(initialOwnerBalance + fee);
        });

        it("Should prevent non-owner from withdrawing fees", async function () {
            await expect(
                dexRouter.connect(otherAccount).withdrawFees(await mockTokenA.getAddress(), 100, otherAccount.address)
            ).to.be.revertedWithCustomError(dexRouter, "OwnableUnauthorizedAccount");
        });
    });

    describe("Swap Execution", function () {
        const amountIn = ethers.parseEther("100");

        beforeEach(async function () {
            await dexRouter.registerAdapter("DEX1", await adapter1.getAddress());
            await dexRouter.registerAdapter("DEX2", await adapter2.getAddress());
        });

        it("Should swap on specific DEX", async function () {
            await mockTokenA.connect(user).approve(await dexRouter.getAddress(), amountIn);

            const tx = await dexRouter.connect(user).swapOnDex(
                "DEX1",
                await mockTokenA.getAddress(),
                await mockTokenB.getAddress(),
                amountIn,
                0,
                user.address
            );

            const fee = (amountIn * BigInt(FEE_BPS)) / BigInt(BPS_DENOMINATOR);
            const amountAfterFee = amountIn - fee;
            const expectedOut = (amountAfterFee * BigInt(await adapter1.rate())) / BigInt(1e18); // 1:1 rate in mock

            await expect(tx)
                .to.emit(dexRouter, "SwapExecuted")
                .withArgs(user.address, await mockTokenA.getAddress(), await mockTokenB.getAddress(), amountIn, expectedOut, "DEX1", fee);

            expect(await mockTokenB.balanceOf(user.address)).to.equal(expectedOut);
        });

        it("Should find best route and swap", async function () {
            // Set DEX2 to have a better rate (1.1x)
            await adapter2.setRate(ethers.parseEther("1.1")); // 10% better

            await mockTokenA.connect(user).approve(await dexRouter.getAddress(), amountIn);

            const tx = await dexRouter.connect(user).swapBestRoute(
                await mockTokenA.getAddress(),
                await mockTokenB.getAddress(),
                amountIn,
                0,
                user.address
            );

            const fee = (amountIn * BigInt(FEE_BPS)) / BigInt(BPS_DENOMINATOR);
            const amountAfterFee = amountIn - fee;
            // Should choose DEX2
            const expectedOut = (amountAfterFee * BigInt(11)) / BigInt(10);

            await expect(tx)
                .to.emit(dexRouter, "SwapExecuted")
                .withArgs(user.address, await mockTokenA.getAddress(), await mockTokenB.getAddress(), amountIn, expectedOut, "DEX2", fee);
        });

        it("Should revert if slippage is too high", async function () {
            await mockTokenA.connect(user).approve(await dexRouter.getAddress(), amountIn);

            // Expecting 200 tokens output for 100 input (impossible with 1:1 rate)
            const minAmountOut = ethers.parseEther("200");

            await expect(
                dexRouter.connect(user).swapOnDex(
                    "DEX1",
                    await mockTokenA.getAddress(),
                    await mockTokenB.getAddress(),
                    amountIn,
                    minAmountOut,
                    user.address
                )
            ).to.be.revertedWith("MockDexAdapter: Insufficient output");
        });

    });

    describe("Quote Functions", function () {
        beforeEach(async function () {
            await dexRouter.registerAdapter("DEX1", await adapter1.getAddress());
            await dexRouter.registerAdapter("DEX2", await adapter2.getAddress());
        });

        it("Should get quote from specific DEX", async function () {
            const amountIn = ethers.parseEther("100");
            const quote = await dexRouter.getQuote("DEX1", await mockTokenA.getAddress(), await mockTokenB.getAddress(), amountIn);
            expect(quote).to.equal(amountIn); // 1:1
        });

        it("Should find best route", async function () {
            const amountIn = ethers.parseEther("100");
            // Set DEX2 to have a better rate (1.1x)
            await adapter2.setRate(ethers.parseEther("1.1")); // 10% better

            const result = await dexRouter.findBestRoute(await mockTokenA.getAddress(), await mockTokenB.getAddress(), amountIn);
            expect(result.bestDex).to.equal("DEX2");
            expect(result.bestAmountOut).to.equal((amountIn * BigInt(11)) / BigInt(10));
        });
    });
});
