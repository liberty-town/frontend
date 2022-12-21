<!--常见问题-->
<template>
  <layout>
    <div class="checkout-tabs">
      <div class="row">
        <div class="col-lg-2">

          <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">

            <router-link to="/faqs?tab=0" :class="`cursor-pointer nav-link ${tab === 0 ? 'active' :''}`">
              <i class="fas fa-quote-left fs-2 mt-4 mb-2"></i>
              <p class="fw-bold mb-4">Motivation</p>
            </router-link>

            <router-link to="/faqs?tab=1" :class="`cursor-pointer nav-link ${tab === 1 ? 'active' :''}`">
              <i class="fas fa-question fs-2 mt-4 mb-2"></i>
              <p class="fw-bold mb-4">FAQ</p>
            </router-link>

            <router-link to="/faqs?tab=2" :class="`cursor-pointer nav-link ${tab === 2 ? 'active' :''}`">
              <i class="fas fa-graduation-cap fs-2 mt-4 mb-2"></i>
              <p class="fw-bold mb-4">Tutorials</p>
            </router-link>

            <router-link to="/chat/conversation/LIBERTY16rjckf96bsBxFVRWnpgVf9PbEW9dL7JZcYgVwVR5Ff2gegUrjq"
                         class="nav-link">
              <i class="fas fa-headset fs-2 mt-4 mb-2"></i>
              <p class="fw-bold mb-4">Support</p>
            </router-link>

          </div>
        </div>

        <div class="col-lg-10">
          <div class="card">
            <div class="card-body">

              <div class="tab-content">
                <div :class="`tab-pane fade ${tab === 0 ? 'active show':''}`">
                  <h4 class="card-title mb-5">Motivation</h4>
                  <div class="faq-box d-flex mb-4">
                    <blockquote class="blockquote text-end border-end-primary border-end-3">
                      <p>
                        I think that the Internet is going to be one of the major forces for reducing the role of
                        government.
                        The one thing that's missing, but that will soon be developed, is a reliable e-cash - a method
                        whereby on the Internet you can transfer funds from A to B without A knowing B or B knowing A.
                      </p>
                      <footer class="blockquote-footer">
                        Milton Friedman
                        <cite title="Source Title">Economist and Nobel laureate</cite>
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>

              <div class="tab-content">
                <div :class="`tab-pane fade ${tab === 1 ? 'active show':''}`">
                  <h4 class="card-title mb-5">Frequently Asked Questions</h4>
                  <div class="faq-box d-flex mb-4">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">What is LibertyTown?</h5>
                      <p class="fs-5 text-muted">LibertyTown is a non-custodial and decentralized federated network.
                        Users can browse existing federations or create new ones. Each federation consists of a group
                        of anonymous people who publishes various listings and communicate securely via an encrypted
                        chat. Each federation has its own distributed network made of nodes.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex mb-4">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">How do I make an account?</h5>
                      <p class="fs-5 text-muted">IN LT, everything is decentralized, so creating an account is not
                        necessary. A set of public and private keys are used to generate your pseudo-anonymous digital
                        identity. Using the top right menu, you can import and export your digital pseudo-identity.
                        When you visit LibertyTown for the first time, your browser automatically creates a new account.
                        Your digital identity is stored locally inside your browser only.
                        You can export your digital account to a JSON file.
                        You can import and restore your account at a later time.</p>
                    </div>
                  </div>
                  <div class="faq-box d-flex mb-4">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">How do I buy?</h5>
                      <p class="fs-5 text-muted">Find what you're looking for using the search bar, then click the "BUY"
                        button. The system will then walk you through each step of the transaction to complete it
                        anonymously. Basically, you start an end-to-end encrypted conversation with a seller discussing
                        the details of your purchase. Then you are required to pay for the items using an anonymous
                        multisig payment. If there are no search results, you can add a "BUY" listing that will be
                        honored later by another user.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex mb-4">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">How do I add a listing?</h5>
                      <p class="fs-5 text-muted">Depending on the type of listing you want to publish, when you click
                        the "ADD listing" button select "BUY" OR "SELL" type accordingly.</p>
                    </div>
                  </div>
                  <div class="faq-box d-flex mb-4">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">What is a GateWay LT?</h5>
                      <p class="fs-5 text-muted">
                        The gateway is an entry to the LibertyTown ecosystem. The gateway allows users to connect to the
                        federated network and access the online service anonymously. The Gateway can be of several
                        types: deep web (.onion, .i2p), clearnet (.com, .org), or a desktop or mobile app.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">What is an LT federation?</h5>
                      <p class="fs-5 text-muted">A federation is a decentralized community that has a leader who
                        oversees to ensure the place to be free of spam and scams. The leader has the possibility to
                        chose the federation's moderators,
                        validators, and seed nodes as well as makes sure the decentralized network has enough
                        nodes to reach consensus. Community members can set up nodes to join the network and help to
                        decentralize the federation.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">How does the encrypted chat work?</h5>
                      <p class="fs-5 text-muted">A secure channel of communication is created by the encrypted chat
                        utilizing
                        strong encryption, between two parties. Then the messages are stored decentralized in the
                        federation distributed network.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">What is the role of the chat Moderator?</h5>
                      <p class="fs-5 text-muted">The moderator's job is to make sure that there are no disagreements
                        between buyers and sellers. If there are disputes, the moderator can help to reach an agreement
                        between the two parties unlocking the anonymous multi-sign transaction to one party.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20"> Is LT safe if it uses JavaScript?</h5>
                      <p class="fs-5 text-muted">Yes, as long as you're using Tor or I2P. Verify that the device you are
                        connected from does not contain any personal information and has not been used for anything
                        else than browsing the Deep web. To avoid making mistakes that could compromise the anonymity
                        provided by LT technology, you must be a totally differently person when using your device
                        on the Tor/I2P network.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">Do I have to use Tor to access LT?</h5>
                      <p class="fs-5 text-muted">The Tor Browser/Whonix/Tails and I2P are the recommended ways to access
                        LT gateways. The Tor browser is the only option that is recommended for domain gateways.
                        When using Desktop or Mobile App gateways, it is absolutely necessary to have Tor/I2P installed
                        and configure them to use the Tor/I2P as a Proxy.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">Can LT be attacked or made inaccessible?</h5>
                      <p class="fs-5 text-muted">Like all technologies, LT is vulnerable to attacks. However, an
                        attacker has
                        to take down all each federation's distributed networks.
                        The complexity to attack a single federation's distributed network could be exactly as hard as
                        attacking
                        the Bitcoin network. LT is therefore unstoppable after it gets some user adoption.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">Why would anyone keep a federation active?</h5>
                      <p class="fs-5 text-muted">Either out of passion or for financial stimulation. For moderators, LT
                        permits a modest reward. If A and B exchange funds, the moderator receives a small reward.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">Should I have concerns about fake reviews?</h5>
                      <p class="fs-5 text-muted">
                        Every decentralized federation has its own review policy.
                        You should trust the reviews of a particular federation only if you trust that federation.
                        Each review is approved by the decentralized network of moderators.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">Why use LT and not a conventional marketplace?</h5>
                      <p class="fs-5 text-muted">Because we take every precaution and reasonable measures to prevent
                        human error and maintain the privacy of all its users. Just like other decentralized networks (
                        Bitcoin, Bittorrent or Tor),
                        nobody should be able to DDoS the LT federated network. Additionally, it is non-custodial,
                        enabling direct end-to-end encrypted communication and anonymous transfers between the two
                        parties
                        without the need for a custodian middleman.
                        The moderators only serves the purpose to resolve disputes between the two parties that no
                        longer
                        agree each other. This proves the federation will never be in the custody of the users' coins.
                        Every sensitive data of the decentralized data is encrypted and can be accessed only with the
                        private key of the owner. The only person who can access it from the network is the data owner,
                        who can decrypt
                        it and read it. Because of this, LT is the crown jewel of the Deep Web.
                      </p>
                    </div>
                  </div>
                  <div class="faq-box d-flex">
                    <div class="flex-shrink-0 me-3 faq-icon">
                      <i class="fas fa-circle-question fa-2x text-success"/>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="font-size-20">Why PANDORA CASH and not Monero?</h5>
                      <p class="fs-5 text-muted">
                        PANDORA CASH has a bigger anonymity set than Monero. While XMR only supports 16, PCASH supports
                        the generation of anonymity sets up to 256.
                        PANDORA CASH is 16 times more anonymous than Monero.
                      </p>
                      <p class="fs-5 text-muted">
                        Because Monero's wallet is UTXO, you must download the entire Blockchain in order to anonymously
                        decrypt your balance without using a trusted middleman. The size of the Monero blockchain as of
                        right now is 140GB. Consider when Monero might be adopted. It would be necessary to download
                        terabytes of data.
                        PCASH uses encrypted accounts. A mere 65 bytes are required to sync your PANDORA CASH wallet.
                      </p>
                      <p class="fs-5 text-muted">
                        The PANDORA CASH ecosystem is multi-asset. Therefore, you are able to create tokens in this
                        ecosystem. New assets could be created like wrapped BTC/ETH/DAI, which enables DEXes to
                        anonymize your original tokens. When it comes to enabling future anonymous cryptocurrency
                        payments, this feature is crucial.
                      </p>
                      <p class="fs-5 text-muted">
                        The anonymity of users can be at anytime at risk in Monero. In XMR a large-scale Dust attack can
                        be
                        operated by an malicious actor to deanonymize real users. Transactions from an attacker could be
                        chosen by your wallet as decoys.
                        These exploits had been studied and they present a real danger to all Cryptonote based privacy
                        coins. These attacks are not possible in PANDORA CASH as it is resistant to dust and
                        spam transactions attacks. Users of Monero may also lose their anonymity if forks force them to
                        perform the same transaction twice using different dummy addresses.
                        Since PCASH uses Homomorphic Encrypted Account it is not vulnerable to UTXO based attacks.
                      </p>
                      <p class="fs-5 text-muted">
                        Numerous actors who rented a lot of computation power for a short time attacked several POW
                        blockchains. Double spending is a risk with Monero because it uses POW consensus. A novel
                        POS consensus used by PANDORA CASH makes 51% POW attacks impossible.
                      </p>
                      <p class="fs-5 text-muted">
                        Transactions are prunable in PANDORA CASH. This means the blockchain's size can be reduced
                        without compromising the data.
                      </p>
                      <p class="fs-5 text-muted">
                        Since PCASH is a new player on the market, there is a lot of room for growth. This plays to its
                        advantage also for early users.
                      </p>

                    </div>
                  </div>
                </div>

                <div class="tab-content">
                  <div :class="`tab-pane fade ${tab === 2 ? 'active show':''}`">
                    <h4 class="card-title mb-5">Tutorials</h4>
                    <div class="faq-box d-flex mb-4">

                      <embed width="420" height="315" src="https://www.youtube.com/embed/NGiUhjuB22Y">

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </layout>

</template>

<script>
import Layout from "src/views/layout/layout"

export default {

  components: {Layout},

  computed: {
    tab() {
      return Number.parseInt(this.$route.query.tab || 0)
    }
  },

  watch: {
    $route: {
      immediate: true,
      handler(val, oldVal) {
        this.$store.commit('setPage', {
          title: "FAQs & Support",
        })
      }
    }
  },

}
</script>