import React from 'react'
import ReactDOM from 'react-dom/client'
import { DexRouterWidget, Web3Provider } from '../../widget/src'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Web3Provider theme="dark">
            <DexRouterWidget
                theme="dark"
                primaryColor="#E84142"
                borderRadius="lg"
                defaultTokenIn="AVAX"
                defaultTokenOut="USDC"
            />
        </Web3Provider>
    </React.StrictMode>,
)
