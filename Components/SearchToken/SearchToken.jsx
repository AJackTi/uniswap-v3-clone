import React, { useState } from 'react';

import Image from 'next/image';

import images from '../../assets';
//INTERNAL IMPORT
import Style from './SearchToken.module.css';

const SearchToken = ({ openToken, tokens, tokenData }) => {
  // UseState
  const [active, setActive] = useState(1);

  let tokenList = [];
  for (let i = 0; i < tokenData.length; i++) {
    tokenList.push(tokenData[i]);
  }

  // const coin = [
  //   {
  //     img: images.ether,
  //     name: "ETH",
  //   },
  //   {
  //     img: images.ether,
  //     name: "DAI",
  //   },
  //   {
  //     img: images.ether,
  //     name: "DOG",
  //   },
  //   {
  //     img: images.ether,
  //     name: "FUN",
  //   },
  //   {
  //     img: images.ether,
  //     name: "WETH9",
  //   },
  //   {
  //     img: images.ether,
  //     name: "UNI",
  //   },
  //   {
  //     img: images.ether,
  //     name: "TIME",
  //   },
  //   {
  //     img: images.ether,
  //     name: "LOO",
  //   },
  //   {
  //     img: images.ether,
  //     name: "OOO",
  //   },
  //   {
  //     img: images.ether,
  //     name: "HEY  ",
  //   },
  // ];
  return (
    <div className={Style.SearchToken}>
      <div className={Style.SearchToken_box}>
        <div className={Style.SearchToken_box_heading}>
          <h4>Select a token</h4>
          <Image
            src={images.close}
            alt="close"
            width={50}
            height={50}
            onClick={() => openToken(false)}
          />
        </div>

        <div className={Style.SearchToken_box_search}>
          <div className={Style.SearchToken_box_search_img}>
            <Image src={images.search} alt="img" width={20} height={20} />
          </div>
          <input type="text" placeholder="Search name and past the address" />
        </div>

        <div className={Style.SearchToken_box_tokens}>
          {tokenList.map((el, i) => (
            <span
              key={i + 1}
              className={active == i + 1 ? `${Style.active}` : ""}
              onClick={() => {
                tokens({
                  name: el.name,
                  image: el.img || "",
                  symbol: el.symbol,
                  tokenBalance: el.balance,
                  tokenAddress: el.address,
                });
                setActive(i + 1);
              }}
            >
              <Image
                src={el.img || images.ether}
                alt="image"
                width={30}
                height={30}
              />
              {el.symbol}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchToken;
