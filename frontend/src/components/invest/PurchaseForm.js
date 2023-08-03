import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Popup from './Popup/Popup';

const PurchaseForm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentReward, setCurrentReward] = useState(0);

    const dispatch = useDispatch();
    const account = useSelector(state => state.account);
    const totalBalance = useSelector(state => state.totalBalance);
    const rewardsPerUnitTime = useSelector(state => state.rewardsPerUnitTime);
    const timeUnit = useSelector(state => state.timeUnit);
    const stakedTokens = useSelector(state => state.stakedTokens);
    const unstakedTokens = useSelector(state => state.unstakedTokens);
    const amountStaked = useSelector(state => state.amountStaked);
    const timeOfLastUpdate = useSelector(state => state.timeOfLastUpdate);
    const unclaimedRewards = useSelector(state => state.unclaimedRewards);

    const stakeAll = () => {
        if (!account) {
            toast.info('Please connect wallet!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        if (unstakedTokens.length > 0) {
            var tokenIds = unstakedTokens.map(item => item.id);
            dispatch({ type: "STAKE_ALL_TOKENS", payload: { tokenIds: tokenIds } });
        }
        else {
            toast.info('There is no token to stake!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    const claim = () => {
        if (!account) {
            toast.info('Please connect wallet!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        if (currentReward > 0)
            dispatch({ type: "CLAIM_TOKEN", payload: {} });
        else {
            toast.info('There is no reward!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    const unstakeAll = () => {
        if (!account) {
            toast.info('Please connect wallet!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        if (stakedTokens.length > 0) {
            var tokenIds = unstakedTokens.map(item => item.id);
            dispatch({ type: "UNSTAKE_ALL_TOKENS", payload: tokenIds });
        }
        else {
            toast.info('There is no token to unstake!', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    const handleConnect = async () => {
        if (window.ethereum) {
            await window.ethereum.enable();
            dispatch({
                type: 'CONNECT_WALLET',
            });
        }
        else {
            toast.info('Please install metamask on your device', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        togglePopup();
    }

    const togglePopup = () => {
        setIsOpen(!isOpen);
    };

    const updateReward = () => {
        let time = parseInt(Date.now() / 1000);

        console.log("timeOfLastUpdate: ", timeOfLastUpdate);
        var reward = unclaimedRewards + (time - timeOfLastUpdate) * amountStaked * rewardsPerUnitTime / timeUnit;
        console.log("reward: ", reward);
        reward = parseFloat(reward).toFixed(5);
        setCurrentReward(reward);
    }

    useEffect(() => {
        if (account) {
            setTimeout(() => {
                setInterval(updateReward, 1000);
            }, 1000);
        }
    }, [timeOfLastUpdate]);

    useEffect(() => {
        if (account) {
            setTimeout(() => {
                dispatch({ type: "GET_ACCOUNT_INFO", payload: {} });
            }, 500);
        }
    }, [account, dispatch]);

    useEffect(() => {
        dispatch({ type: "GET_CONTRACT_INFO", payload: {} });
    }, []);

    return (
        <>
            <div className="purchase-form wallet-connection" >
                <div className="purchase-amount">
                    {
                        account ?
                            <div className="account-address">{account.slice(0, 6) + "..." + account.slice(38)}</div>
                            :
                            <button onClick={() => togglePopup()} className="connectWallet">Connect wallet</button>
                    }
                    <div className="newInputs">
                        <div className="leftInputs NewHolder">
                            <div className="amoutToken">
                                <label>Total Balance:</label>
                                {
                                    totalBalance > 0 ? (<span>{totalBalance}</span>) : (<span>0</span>)
                                }
                            </div>
                        </div>

                        <div className="rightInputs NewHolder">
                            <div className="amoutToken">
                                <label>Rewards:</label>
                                {
                                    currentReward > 0 ? (<span>{currentReward}</span>) : (<span>0</span>)
                                }
                            </div>
                        </div>

                    </div>
                    <button className="connectWallet" onClick={() => stakeAll()}>Stake All</button>
                    <button className="connectWallet" onClick={() => claim()}>Claim</button>
                    <button className="connectWallet" onClick={() => unstakeAll()}>Unstake All</button>
                </div>
                {
                    isOpen && (
                    <Popup
                        content={
                            <>
                                <div className="connectTitle">Connect a wallet</div>
                                <div className="walletHolder">
                                    <div className="walletItem">
                                        <a onClick={() => handleConnect()} href="#root" >
                                            <img alt="MetaMask" src="/img/MetaMask_Fox.png" />
                                            MetaMask
                                            <span className="arrowRightBtn">
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </>
                        }
                        handleClose={() => togglePopup()}
                    />
                )}
            </div>
        </>
    );
}

export default PurchaseForm;