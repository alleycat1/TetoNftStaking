import StatefulComponent from "../components/StatefulComponent";
import { Toast } from "../components/common/Toast";
import { Footer } from "../components/common/Footer";
import { connect } from "react-redux";
import NFTList from "../components/invest/NFTList";
import PurchaseForm from "../components/invest/PurchaseForm";

class Home extends StatefulComponent {
    render() {
        return (
            <>
                <div id="main">
                    <Toast/>
                    <section id="HomeHero">
                        <div>
                            <h1>Unstaked NFT</h1>
                            <NFTList type="unstaked" />
                        </div>
                        <div>
                            <h1>Staked NFT</h1>
                            <NFTList type="staked" />
                        </div>
                        <PurchaseForm />
                    </section>
                </div>
                <Footer/>
            </>
        );
    }
}


export default connect()(Home);
