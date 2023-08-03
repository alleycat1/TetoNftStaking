import StatefulComponent from "../StatefulComponent";
import { connect } from "react-redux";

class NFTList extends StatefulComponent {
    onUnstake = (tokenId) => {
        console.log("clicked unstake", tokenId);
        this.props.dispatch({ type: "UNSTAKE_TOKEN", payload: { tokenId: tokenId } });
    }

    onStake = (tokenId) => {
        console.log("clicked stake", tokenId);
        this.props.dispatch({ type: "STAKE_TOKEN", payload: { tokenId: tokenId } });
    }

    render() {
        return (
            <>
                <div className="nft-list">
                    {
                        (this.props.type === "staked") && this.props.stakedTokens &&
                        this.props.stakedTokens.map(item => {
                            return (
                                <div key={item.id} className="nft-list-item">
                                    <img src={item.url} width={100} height={100} />
                                    <div className="nft-button-container">
                                        <button onClick={ () => this.onUnstake(item.id) }>Untake</button>
                                    </div>
                                </div>
                            );
                        })
                    }
                    {
                        (this.props.type === "unstaked") && this.props.unstakedTokens &&
                        this.props.unstakedTokens.map(item => {
                            return (
                                <div key={item.id} className="nft-list-item">
                                    <img src={item.url} width={100} height={100} />
                                    <div className="nft-button-container">
                                        <button onClick={ () => this.onStake(item.id) }>Stake</button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        account : state.account,
        stakedTokens: state.stakedTokens,
        unstakedTokens: state.unstakedTokens,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NFTList);
