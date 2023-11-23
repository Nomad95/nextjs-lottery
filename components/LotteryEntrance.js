import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis, useMoralisSubscription } from "react-moralis";
import { useEffect, useState, useEvent } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled, enableWeb3 } = useMoralis();
  //Get chainId from connected Wallet
  const chainId = parseInt(chainIdHex);
  console.log(chainId);
  const lotteryAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  //Hooks
  const [entranceFee, setEntranceFee] = useState("0");
  const [numPlayers, setNumPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  //Hook for notifications
  const dispatch = useNotification();

  const {
    runContractFunction: enterLottery,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "enterLottery",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUi() {
    const entranceFeeFromCall = (await getEntranceFee()).toString();
    setEntranceFee(entranceFeeFromCall);

    const numOfPlayersFromCall = (await getNumberOfPlayers()).toString();
    setNumPlayers(numOfPlayersFromCall);

    const recentWinnerFromCall = (await getRecentWinner()).toString();
    setRecentWinner(recentWinnerFromCall);
  }

  //Do this code when isWeb3Enabled changes
  useEffect(() => {
    if (isWeb3Enabled) {
      updateUi();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNewNotification(tx);
    updateUi();
  };

  const handleNewNotification = function () {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div className="p-5">
      Hi from lottery entrance!
      {lotteryAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async function () {
              await enterLottery({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              });
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Lottery</div>
            )}{" "}
          </button>
          <div>
            Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </div>
          <div>Number of players: {numPlayers}</div>
          <div>Recent winner: {recentWinner}</div>
        </div>
      ) : (
        <div>No Lottery address detected</div>
      )}
    </div>
  );
}
