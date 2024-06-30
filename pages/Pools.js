import React, {
  useContext,
  useState,
} from 'react';

import {
  PoolAdd,
  PoolConnect,
} from '../Components/index';
import { SwapTokenContext } from '../Context/SwapContext';
import Style from '../styles/Pools.module.css';

const Pool = () => {
  const { account, createLiquidityAndPool, tokenData, getAllLiquidity } =
    useContext(SwapTokenContext);

  const [closePool, setClosePool] = useState(false);
  return (
    <div className={Style.Pool}>
      {closePool ? (
        <PoolAdd
          account={account}
          setClosePool={setClosePool}
          tokenData={tokenData}
          createLiquidityAndPool={createLiquidityAndPool}
        />
      ) : (
        <PoolConnect
          setClosePool={setClosePool}
          getAllLiquidity={getAllLiquidity}
          account={account}
        />
      )}
    </div>
  );
};

export default Pool;
