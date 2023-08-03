import { createStore } from 'redux'
import Web3 from 'web3';
import config from '../contract/index';
import { toast } from 'react-toastify';

const _initialState = {
    account: "",
    totalBalance: 0,
    rewardsPerUnitTime: 0,
    timeUnit: 1,
    stakedTokens: [],
    unstakedTokens: [],
    amountStaked: 0,
    timeOfLastUpdate: 0,
    unclaimedRewards: 0
};

const init = (init) => {
    return init;
};

const NFT_PORT_API_URL = "https://api.nftport.xyz/v0/accounts";
const NFT_PORT_API_KEY = "9ab697a7-eea2-414e-b088-6658ceb53b4d";

//const globalWeb3 = new Web3(config.mainNetUrl);
const provider = Web3.providers.HttpProvider(config.mainNetUrl);
const web3 = new Web3(Web3.givenProvider || provider);

const NFTStakeCon = new web3.eth.Contract(config.NFTStakeAbi, config.NFTStakeAddress);
const ERC721Con = new web3.eth.Contract(config.ERC721Abi, config.ERC721Address);

console.log("provider", config.mainNetUrl);
console.log("NFT staking contract", config.NFTStakeAddress);
console.log("ERC721 token contract", config.ERC721Address);

const stake = async (state, tokenIds) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        await NFTStakeCon.methods.stake(tokenIds).send({ from: state.account });
    } catch (e) {
        console.log("Error on Stake: ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

const claim = async (state) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }
    try {
        await NFTStakeCon.methods.claimRewards().send({ from: state.account });
        store.dispatch({
            type: "RETURN_DATA",
            payload: {},
        });
    } catch (e) {
        console.log("Error on Stake : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

const unstake = async (state, tokenIds) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        await NFTStakeCon.methods.withdraw(tokenIds).send({ from: state.account });
        store.dispatch({
            type: "RETURN_DATA",
            payload: {},
        });
    } catch (e) {
        console.log("Error on Stake : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

export const getAccountInfo = async (state) => {
    if (!state.account) {
        alertMsg("Please connect metamask!");
        return;
    }

    try {
        //var broBalance = await bro.methods.balanceOf(state.account).call();
        //broBalance = globalWeb3.utils.fromWei(broBalance, 'ether');
        //console.log("broBalance = ", broBalance);

        //var account = '0x79ca15110241605ae97f73583f5c3f140506fb80';
        var account = state.account;
        var stakeInfo = await NFTStakeCon.methods.getStakeInfo(account).call();
        //console.log(stakeInfo);

        var stakedTokens = stakeInfo._tokensStaked.map(async tokenId => {
            var tokenURI = await ERC721Con.methods.tokenURI(tokenId).call();
            return {
                id: tokenId,
                url: tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            };
        });

        var staker = await NFTStakeCon.methods.stakers(account).call();
        console.log(staker);

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: NFT_PORT_API_KEY
            }
        };
        
        var allNFTs = [];
        var continuation = true;
        while (continuation) {
            var res = await fetch(`${NFT_PORT_API_URL}/${account}?chain=polygon&page_size=50&include=metadata&contract_address=${config.ERC721Address}`, options);
            res = await res.json();
            allNFTs = [...allNFTs, ...res.nfts];
            continuation = res.continuation;
        }
        //console.log(allNFTs);

        var unstakedNFTs = [];
        unstakedNFTs = allNFTs.filter(item => {
            let finded_item = stakedTokens.find(item2 => {
                return item.id === item2.id;
            });
            if (finded_item)
                return false;
            return true;
        });

        var unstakedTokens = unstakedNFTs.map(item => {
            var tokenURI = "";
            if (item.file_url)
                tokenURI = item.file_url;
            
            return {
                id: item.token_id,
                url: tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            };
        });
        //console.log(unstakedTokens);

        store.dispatch({
            type: "UPDATE_ACCOUNT_INFO",
            payload: {
                stakedTokens: stakedTokens,
                unstakedTokens: unstakedTokens,
                amountStaked: staker ? parseFloat(staker.amountStaked).toFixed(2) : 0,
                timeOfLastUpdate: staker ? parseFloat(staker.timeOfLastUpdate).toFixed(2) : 0,
                unclaimedRewards: staker ? parseFloat(staker.unclaimedRewards).toFixed(2) : 0
            }
        });
    } catch (e) {
        console.log(e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

export const getContractInfo = async (state) => {
    if (NFTStakeCon === undefined) {
        alertMsg("Please install metamask!");
        return;
    }

    try {
        var totalBalance = await NFTStakeCon.methods.getRewardTokenBalance().call();
        var rewardsPerUnitTime = await NFTStakeCon.methods.getRewardsPerUnitTime().call();
        var timeUnit = await NFTStakeCon.methods.getTimeUnit().call();
        //totalBalance = globalWeb3.utils.fromWei(totalBalance.toString(), 'ether');
        console.log("Total Balance: ", totalBalance);
        console.log("RewardsPerUnitTime: ", rewardsPerUnitTime);
        console.log("TimeUnit: ", timeUnit);

        store.dispatch({
            type: "UPDATE_CONTRACT_INFO",
            payload: {
                totalBalance: parseFloat(totalBalance).toFixed(2),
                rewardsPerUnitTime: parseFloat(rewardsPerUnitTime).toFixed(2),
                timeUnit: parseFloat(timeUnit).toFixed(2)
            }
        })
    } catch (e) {
        console.log("Error on getContractInfo : ", e);
        store.dispatch({ type: "RETURN_DATA", payload: {} });
    }
}

const reducer = (state = init(_initialState), action) => {
    switch (action.type) {
        case "GET_CONTRACT_INFO":
            getContractInfo(state);
            break;

        case "UPDATE_CONTRACT_INFO":
            state = {
                ...state,
                ...action.payload
            };
            break;

        case "UPDATE_ACCOUNT_INFO":
            state = {
                ...state,
                ...action.payload
            };
            break;

        case "GET_ACCOUNT_INFO":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            getAccountInfo(state);
            break;

        case "STAKE_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            stake(state, [action.payload.tokenId]);
            break;

        case "STAKE_ALL_TOKENS":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            stake(state, action.payload.tokenIds);
            break;

        case "CLAIM_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            claim(state);
            break;

        case "UNSTAKE_TOKEN":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            unstake(state, [action.payload.tokenId]);
            break;

        case "UNSTAKE_ALL_TOKENS":
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            unstake(state, action.payload.tokenIds);
            break;

        case 'CONNECT_WALLET':
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }

            web3.eth.getAccounts((err, accounts) => {
                store.dispatch({
                    type: 'RETURN_DATA',
                    payload: { account: accounts[0] }
                });
            })
            break;

        case 'CHANGE_ACCOUNT':
            if (!checkNetwork(state.chainId)) {
                changeNetwork();
                return state;
            }
            return state;

        case 'RETURN_DATA':
            return Object.assign({}, state, action.payload);

        default:
            break;
    }
    return state;
}

const alertMsg = (msg) => {
    toast.info(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

const checkNetwork = (chainId) => {
    if (web3.utils.toHex(chainId) !== web3.utils.toHex(config.chainId)) {
        alertMsg("Change network to Polygon Mainnet!");
        return false;
    } else {
        return true;
    }
}

const changeNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: config.chainId,
                            chainName: 'Avalanche',
                            rpcUrls: [config.mainNetUrl] /* ... */,
                        },
                    ],
                });
            } catch (addError) {
            }
        }
    }
}

if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        console.log("Account changed: ", accounts);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { account: accounts[0] }
        });
        store.dispatch({
            type: "CHANGE_ACCOUNT",
            payload: { account: accounts[0] }
        });
    })

    window.ethereum.on('chainChanged', function (chainId) {
        checkNetwork(chainId);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { chainId: chainId }
        });
    });

    web3.eth.getChainId().then((chainId) => {
        checkNetwork(chainId);
        store.dispatch({
            type: "RETURN_DATA",
            payload: { chainId: chainId }
        });
    })
}

const store = createStore(reducer);
export default store