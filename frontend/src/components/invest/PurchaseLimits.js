import StatefulComponent from "../StatefulComponent";
import { connect } from "react-redux";

class PurchaseLimits extends StatefulComponent {
    render() {
        if(this.props.compact) {
            return (
                <>
                    {/* <div className="leftBottom">Min {this.props.min} &ndash; Max {this.props.max}</div> */}
                </>
            );
        } else {
            return (
                <div className="priceHolder">
                    <div className="leftPrice">
                        <span className="grayish">Min purchase</span>
                        <span className="priceValue">{this.props.min}</span>
                    </div>
                    <div className="rightPrice">
                        <span className="grayish">Max purchase</span>
                        <span className="priceValue">{this.props.max}</span>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = state => {
    return {
        min : state.minInvest,
        max : state.maxInvest
    };
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseLimits);
