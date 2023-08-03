import StatefulComponent from "../StatefulComponent";
import { connect } from "react-redux";

  function copyDivToClipboard() {
    var range = document.createRange();
    range.selectNode(document.getElementById("toBeCopied"));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection().removeAllRanges();// to deselect
    document.getElementById("copyBtn").classList.add('copiedTx');
    // alert("Transaction ID has been copied to your clipboard.");
}

class PurchaseComplete extends StatefulComponent {

    render() {
        return (
            // to change body class for confetti background
            document.querySelector("body").classList.add("confetti"),
            <>
                <div className="purchaseComplete wallet-connection">
                    <div className="video-container">
                        <iframe src="https://www.youtube.com/embed/7OS8Dxf75iw" frameborder="0" allow="encrypted-media" title="https://www.youtube.com/embed/7OS8Dxf75iw" />
                    </div>

                    <div className="completeHolder">
                        <div className="orderDetails">
                            <div className="completeTitle"><span className="grayish">Order details</span></div>
                            <div className="transacResume">
                                <img alt="USDC.e" src="https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/tokens/USDC/logo.png" />
                                <span className="cmplNmb">1000.00</span>
                                <span className="cmplCrncy">USDC.e</span>
                                <i className="fa-solid fa-arrow-right-long"></i>
                                <img src="/img/logo.png" alt="Bro token"/>
                                <span className="cmplNmb">1000.00</span>
                                <span className="cmplCrncy">BRO</span>
                            </div>
                                {/* 
                                <span>[purchasetokenimage] [purchaseamount] [purchasetoken] <i className="fa-solid fa-arrow-right-long"></i> [returntokenimage] [returnamount] POP</span>
                                */}
                                

                        </div>
                        <div className="transactionIdHolder">
                            <div className="completeTitle"><span className="grayish">Transaction id</span></div>
                            <div className="transacIdcopy">
                                <span id="toBeCopied">[transactionid]</span>
                                <button title="Copy the transaction ID to your clipboard." id="copyBtn" className="copyTransactionId" onClick={() => {copyDivToClipboard()}}>Copy<i class="fa-solid fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
    };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseComplete);
