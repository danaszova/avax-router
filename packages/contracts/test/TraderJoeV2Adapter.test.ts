import { expect } from "chai";
import { ethers } from "hardhat";
import { TraderJoeV2Adapter, DexRouter } from "../typechain-types";

describe("TraderJoeV2Adapter", function () {
    let adapter: TraderJoeV2Adapter;
    let dexRouter: DexRouter;
    let owner: any;
    let user: any;

    // Fuji testnet addresses
    const TJ_ROUTER = "0x8644b5ca4227f3e2a6d393acae870693f6a6ea25";
    const TJ_FACTORY = "0x37b97e3ed7f8dd4aa01ead0b8add6015cc0f86c7";

    // Test tokens on Fuji
    const WAVAX = "0xB31f66aA3C0e6C59128b16A7e6757B4a7d5b2D6C";
    const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
    const USDT = "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7";

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy adapter
        const AdapterFactory = await ethers.getContractFactory("TraderJoeV2Adapter");
        adapter = await AdapterFactory.deploy(TJ_ROUTER, TJ_FACTORY);
        await adapter.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct router address", async function () {
            expect(await adapter.router()).to.equal(TJ_ROUTER.toLowerCase());
        });

        it("Should set the correct factory address", async function () {
            expect(await adapter.factory()).to.equal(TJ_FACTORY.toLowerCase());
        });

        it("Should return correct DEX name", async function () {
            expect(await adapter.dexName()).to.equal("TraderJoe V2");
        });
    });

    // Tests below require mainnet fork or mocks for the external contracts
    describe.skip("Direct Pair Quotes", function () {
        it("Should get quote for AVAX/USDC pair", async function () {
            const amountIn = ethers.parseEther("1"); // 1 AVAX

            await expect(
                adapter.getAmountOut(WAVAX, USDC, amountIn)
            ).to.be.revertedWith("No valid pair found");
        });

        it("Should check if pool exists", async function () {
            const hasPool = await adapter.hasPool(WAVAX, USDC);
            expect(hasPool).to.be.false;
        });
    });

    describe.skip("Multi-hop Quotes", function () {
        it("Should attempt multi-hop through WAVAX", async function () {
            const amountIn = ethers.parseEther("1");

            await expect(
                adapter.getAmountOut(USDC, USDT, amountIn)
            ).to.be.revertedWith("No valid pair found");
        });
    });

    describe("Constant Values", function () {
        it("Should have correct WAVAX address", async function () {
            expect(await adapter.WAVAX()).to.equal(WAVAX);
        });

        it("Should have correct USDC address", async function () {
            expect(await adapter.USDC()).to.equal(USDC);
        });

        it("Should have correct USDT address", async function () {
            expect(await adapter.USDT()).to.equal(USDT);
        });
    });
});
