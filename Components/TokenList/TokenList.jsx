import React from 'react';

import Image from 'next/image';

import images from '../../assets';
//INTERNAL IMPORT
import Style from './TokenList.module.css';

const TokenList = ({ tokenData, setOpenTokenBox }) => {
  console.log("tokenData", tokenData);
  let tokenList = [];
  for (let i = 0; i < tokenData.length; i++) {
    tokenList.push(tokenData[i]);
  }

  return (
    <div className={Style.TokenList}>
      <p
        className={Style.TokenList_close}
        onClick={() => setOpenTokenBox(false)}
      >
        <Image src={images.close} alt="close" width={50} height={50} />
      </p>
      <div className={Style.TokenList_title}>
        <h2>Your Token List</h2>
      </div>

      {tokenList.map((el, i) => (
        <div className={Style.TokenList_box} key={el.address}>
          <div className={Style.TokenList_box_info}>
            <p className={Style.TokenList_box_info_symbol}>{el.symbol}</p>
            <p>
              <span>{el.balance?.slice(0, 9)}</span> {el.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TokenList;
