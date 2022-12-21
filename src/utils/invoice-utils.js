import ValidatorHelper from './validator-helper'
import HttpHelper from "./http-helper";
import StringsUtils from "./strings-utils";
import InvoiceUtils from "./invoice-utils";
import Utils from "./utils-helper"
import config from "src/config"

export default {

    calculateDeadlineSeconds(deadline){
        return new Decimal(deadline).mul(90).round()
    },

    invoiceWhoAmI(invoice, address ){
        if (invoice.buyer.address === address) return "buyer"
        else if (invoice.seller.address === address) return "seller"
        else if (invoice.moderator === address ) return "moderator"
        else return "unknown"
    },

    messageToSignTxConfirmation(invoiceId, tx){
        return Buffer.concat([
            Buffer.from(invoiceId, "base64"),
            Buffer.from(tx, "hex"),
        ])
    },

    messageToSignRecipient(invoiceId, recipient){
        return Buffer.concat([
            Buffer.from(invoiceId, "base64"),
            Buffer.from(recipient, "ascii"),
        ])
    },

    messageToSignDelivery(invoiceId, delivery){
        return Buffer.concat([
            Buffer.from(invoiceId, "base64"),
            Buffer.from(delivery, "ascii"),
        ])
    },

    calculateInvoiceTotal(items, shipping){
        let sum = new Decimal(shipping )
        for (const it of items)
            sum = sum.plus( new Decimal(it.price).times(it.quantity) )
        return sum
    },

    selectRandomModerator(fed){

        if (!fed) throw "Federation doesn't exist"
        if (!fed.moderators.length) throw "Moderator doesn't exist"

        let mod, steps = 0
        while (!mod && steps < 10){
            steps++
            const m = fed.moderators[Math.floor(Math.random()*fed.moderators.length)]
            if ( !m.version.eq(LibertyTown.enums.moderators.MODERATOR_PANDORA) ) continue
            mod = m
        }

        if (!mod) throw "Federation doesn't have any valid moderator"

        return {fed: fed.ownership.address, moderator: mod.ownership.address }
    },

    async propagateClaimTx(fed, tx){

        const node = fed.nodes[Math.floor(Math.random()*fed.nodes.length )]
        const out = await HttpHelper.get(node.url+'/mempool/new-tx', { tx })

        if (!out) throw "No answer"
        if (!out.result) throw "Error propagating Tx"

        return true
    },

    async checkExistenceClaimTx(fed, txId){


        if (!fed) throw "federation not found"

        const node = fed.nodes[Math.floor(Math.random()*fed.nodes.length )]
        const out = await HttpHelper.get(node.url+'/tx', {hash: txId, returnType: 1 })

        if (!out || !out.tx || !out.info) throw "Tx not found in blockchain"
        if (!out.confirmations) return `Tx is in pending. Please wait`
        if (!out.confirmations || out.confirmations.lt(5) ) return `Tx has only ${out.confirmations || '0' } and requires 5 confirmations. Wait a few more minutes and try again later.`

        if (!out.tx.version.eq(LibertyTown.PandoraPay.enums.transactions.TransactionVersion.TX_SIMPLE)) throw "Wrong Transaction - it is not a Simple Transaction"

        return true
    },

    async validateInvoicePayment(invoice, txId, $store){

        const fed = $store.state.federations.dict[invoice.federation]
        if (!fed) throw "federation not found"

        const mod = $store.getters.getFederationModerator(invoice.federation, invoice.moderator)
        if (!mod) throw "moderator not found"

        const node = fed.nodes[Math.floor(Math.random()*fed.nodes.length )]
        const out = await HttpHelper.get(node.url+'/tx', {hash: StringsUtils.hexToBase64(txId), returnType: 1 })

        if (!out || !out.tx || !out.info) throw "Tx not found in blockchain"
        if (!out.confirmations || out.confirmations.lt(5) ) throw `Tx has only ${out.confirmations} and requires 5 confirmations. Wait a few more minutes and try again later.`

        if (!out.tx.version.eq(LibertyTown.PandoraPay.enums.transactions.TransactionVersion.TX_ZETHER)) throw "Wrong Transaction - it is not a Private Transaction"

        if (config.debug ) return

        if (out.tx.payloads.length !== 2) throw "Wrong Transaction - it doesn't have two payloads"
        if (!out.tx.payloads[0].payloadScript.eq(LibertyTown.PandoraPay.enums.transactions.transactionZether.PayloadScriptType.SCRIPT_CONDITIONAL_PAYMENT) ) throw "Wrong Transaction - it doesn't have conditional payment"
        if (!out.tx.payloads[0].extra.deadline.eq( 30000 )) throw "Wrong Transaction - deadline to small"
        if (out.tx.payloads[0].extra.defaultResolution) throw "Wrong Transaction - default resolution should be false"
        if (!out.tx.payloads[0].extra.multisigThreshold.eq(2)) throw "Wrong Transaction - multisig threshold should be 2"
        if (out.tx.payloads[0].extra.multisigPublicKeys.length !== 3) throw "Wrong Transaction - multisig should be 3"

        const dict = {}
        dict[invoice.buyer.multisig] = true
        dict[invoice.seller.multisig] = true
        dict[mod.conditionalPublicKey] = true
        for (const pub of out.tx.payloads[0].extra.multisigPublicKeys)
            if (dict[ pub ]) delete dict[ pub ]
            else throw "incorrect multisig public key is invalid"
    },

    async sendClaimTx(fed, claimTx, $store){

        if (config.debug ) return true

        try{
            const out = await this.checkExistenceClaimTx( fed, claimTx.hash)
            if (typeof out === "string") $store.dispatch('addToast', { type: 'info',
                title: `Not yet validated or included in blockchain.`,
                text: out,
            })
            if (out === true){
                $store.dispatch('addToast', {
                    type: 'success',
                    title: `You claim already!`,
                    text: `Claim tx is already incldued in blockchain.`
                })
                return true
            }
        }catch(e){
            if (e === "Tx not found")
                try {
                    await this.propagateClaimTx( fed, claimTx.serialized)
                    $store.dispatch('addToast', {
                        type: 'info',
                        title: `Claim Transaction was propagated`,
                        text: `Your transaction was created and propagated in the network. It will take a few minutes to get validated and included in Blockchain.`
                    })
                }catch(e){
                    if (e === "Pending Future not found by key") e = "Funds can not be claimed. Either the TxId was provided incorrectly or it was claimed already by the other party."
                    throw e
                }
            else throw e
        }

        return false
    },

    async decryptMessage(message, receiver, $store) {

        try{

            message.decrypted = JSONParse( MyTextDecode( await LibertyTown.chat.decryptMessage(MyTextEncode( JSONStringify({
                message,
                receiver,
            }) )) ) )

            if (Utils.bigNumberInList( message.decrypted.type, [1, 2, 3, 4, 5]) ) message.decrypted.data = JSONParse(Buffer.from(message.decrypted.data, "base64").toString())
            else if ( !message.decrypted.type.eq(0) ) throw "invalid message type"

            if (message.decrypted.type.eq(3)) await this.validateInvoice(message)
            if (message.decrypted.type.eq(2)) await this.validateListing(message)
            if (message.decrypted.type.eq(4)) await this.validateDispute(message, $store)
            if (message.decrypted.type.eq(5)) await this.validateReview(message)

        }catch(e){
            message.error = e.toString()
        }

    },

    async validatePartialInvoice(data, partialInvoice){
        if (!partialInvoice) throw "partialInvoice is missing"
        if (!partialInvoice.buyer || !partialInvoice.buyer.address || !partialInvoice.buyer.nonce || !partialInvoice.buyer.conversionAsset || !partialInvoice.buyer.conversionAmount) throw "partialInvoice buyer is missing"
        if (!partialInvoice.seller || !partialInvoice.seller.address || !partialInvoice.seller.nonce) throw "partialInvoice seller is missing"
        if (!partialInvoice.id) throw "partialInvoice id is missing"
        if (typeof partialInvoice.moderator !== "string") throw "partial moderator is invalid"

        if (ValidatorHelper.validateHashBase64(partialInvoice.seller.nonce)) throw "seller nonce is invalid"
        if (ValidatorHelper.validateHashBase64(partialInvoice.buyer.nonce)) throw "buyer nonce is invalid"

        const id = Buffer.from( await LibertyTown.invoices.createId( MyTextEncode( JSONStringify(partialInvoice) ) ) ).toString("base64")
        if (id !== partialInvoice.id) throw "partialInvoice id is invalid"
    },

    async validateProofsPurchase(data, partialInvoice){
        if (typeof data.proofs.purchase !== "object") throw "invalid proofs"
        if (typeof data.proofs.purchase.data !== "object") throw "invalid proofs"
        if (typeof data.proofs.purchase.signatures !== "object") throw "proofs signatures missing"
        if (ValidatorHelper.validateSignature(data.proofs.purchase.signatures.seller)) throw "invalid proofs signature"
        if (ValidatorHelper.validateSignature(data.proofs.purchase.signatures.buyer)) throw "invalid proofs signature"
        const msg = await LibertyTown.invoices.messageToSignItems( MyTextEncode( JSONStringify( { id: partialInvoice.id, items: data.proofs.purchase.data.items, notes: data.proofs.purchase.data.notes, shipping: data.proofs.purchase.data.shipping }) ) )
        if (await LibertyTown.crypto.verify( this.messageToSignRecipient(partialInvoice.id, msg ), Buffer.from( data.proofs.purchase.signatures.seller, "base64" ), partialInvoice.seller.address ) !== true) "invalid proofs signature"
        if (await LibertyTown.crypto.verify( this.messageToSignRecipient(partialInvoice.id, msg ), Buffer.from( data.proofs.purchase.signatures.buyer, "base64" ), partialInvoice.buyer.address ) !== true) "invalid proofs signature"
    },

    async validateDispute(message, $store){
        const data = message.decrypted.data

        const partialInvoice = data.partialInvoice
        await this.validatePartialInvoice(data, partialInvoice)

        const version = new Decimal(data.version)
        if (!version.isInteger()) throw "invalid version type"
        if (version.lt(0) ||version.gt(2) ) throw "invalid version"

        if (ValidatorHelper.validateHash(data.tx)) throw "tx hash is invalid"

        if (typeof data.proofs !== "object") throw "proofs doesn't exist"

        if (data.info){

            if (data.info.counter instanceof Decimal === false) throw "data info counter is missing"
            if (ValidatorHelper.validateSignature(data.info.signature)) throw "data info signature is missing"

            // 验证
            if (await LibertyTown.crypto.verify( MyTextEncode(JSONStringify({...data.info, signature: undefined})), Buffer.from( data.info.signature, "base64" ), partialInvoice.moderator ) !== true) "data info signature is invalid"
        }

        if (data.version.gte(1)){

            if (!data.info) throw "data.info is missing"

            if (typeof data.resolution !== "boolean") throw "resolution is missing"
            if (ValidatorHelper.validatePandoraPaySignature(data.resolutionSignature)) throw "resolution signature is invalid"

            const mod = $store.getters.getFederationModerator(partialInvoice.federation, partialInvoice.moderator)
            if (!mod) throw "moderator not found"

            if (await LibertyTown.invoices.multisig.verify(MyTextEncode( JSONStringify({
                txId: Buffer.from(data.tx, "hex").toString("base64"),
                payloadIndex: Decimal_0,
                resolution: data.resolution,
                multisigPublicKey: mod.conditionalPublicKey,
                multisigSignature: data.resolutionSignature,
            })) ) !== true) throw "signature is invalid"
        }

        if (data.proofs.purchase)
            await this.validateProofsPurchase(data, partialInvoice)

        if (data.proofs.delivery){
            if (typeof data.proofs.delivery !== "object") throw "invalid proofs"
            if (typeof data.proofs.delivery.data !== "string") throw "invalid proofs"
            if (typeof data.proofs.purchase.signatures !== "object") throw "proofs signatures missing"
            if (ValidatorHelper.validateSignature(data.proofs.delivery.signatures.buyer)) throw "invalid proofs signature"
            if (ValidatorHelper.validateSignature(data.proofs.delivery.signatures.seller)) throw "invalid proofs signature"
            if (await LibertyTown.crypto.verify( this.messageToSignRecipient(partialInvoice.id, data.proofs.delivery.data ), Buffer.from( data.proofs.purchase.signatures.seller, "base64" ), partialInvoice.seller.address ) !== true) "invalid proofs signature"
            if (await LibertyTown.crypto.verify( this.messageToSignRecipient(partialInvoice.id, data.proofs.delivery.data ), Buffer.from( data.proofs.purchase.signatures.buyer, "base64" ), partialInvoice.buyer.address ) !== true) "invalid proofs signature"
        }

        if (data.proofs.recipient){
            if (typeof data.proofs.recipient !== "object") throw "invalid proofs"
            if (typeof data.proofs.recipient.data !== "string") throw "invalid proofs"
            if (ValidatorHelper.validateSignature(data.proofs.recipient.signature)) throw "data info signature is missing"
            if (await LibertyTown.crypto.verify( this.messageToSignRecipient(partialInvoice.id, data.proofs.recipient.data ), Buffer.from( data.proofs.recipient.signature, "base64" ), partialInvoice.moderator ) !== true) "invalid proofs signature"
        }

    },

    async validateReview(message){
        const data = message.decrypted.data

        const partialInvoice = data.partialInvoice
        await this.validatePartialInvoice(data, partialInvoice)

        const version = new Decimal(data.version)
        if (!version.isInteger()) throw "invalid version type"
        if (version.lt(0) ||version.gt(1) ) throw "invalid version"
        if ( typeof data.review !== "object" ) throw "invalid review"
        if ( data.review.score instanceof Decimal === false) throw "invalid score"
        if ( typeof data.review.text !== "string" || data.review.text.length < 5) throw "invalid text"

        if (data.version.eq(1)){

            if (!data.info) throw "data.info is missing"

            if (data.info.counter instanceof Decimal === false) throw "data info counter is missing"
            if (ValidatorHelper.validateSignature(data.info.signature)) throw "data info signature is missing"

            // 验证
            if (await LibertyTown.crypto.verify( MyTextEncode(JSONStringify({...data.info, signature: undefined})), Buffer.from( data.info.signature, "base64" ), partialInvoice.moderator ) !== true) "data info signature is invalid"
        }

        if (data.proofs.purchase)
            await this.validateProofsPurchase(data, partialInvoice)

    },

    async generateInvoiceId(invoice){
        return ( await LibertyTown.invoices.createId(MyTextEncode( JSONStringify({
            federation: invoice.federation,
            moderator: invoice.moderator,
            buyer: {
                address:invoice.buyer.address,
                nonce:invoice.buyer.nonce,
                conversionAsset: invoice.buyer.conversionAsset,
                conversionAmount: invoice.buyer.conversionAmount,
            },
            seller: {
                address: invoice.seller.address,
                nonce: invoice.seller.nonce,
            },
            total: InvoiceUtils.calculateInvoiceTotal(invoice.items, invoice.shipping),
        })) ) ).toString("base64")
    },

    async validateInvoice(message) {

        const data = message.decrypted.data

        const binary = Buffer.from(data.invoice, "base64")

        const deserialized = await LibertyTown.invoices.deserialize(binary)

        data.invoice = JSONParse(MyTextDecode(deserialized))

        const invoice = data.invoice

        const version = data.version
        if (!version.isInteger()) throw "invalid version type"
        if (version.lt(0) ||version.gt(6) ) throw "invalid version"

        if (!invoice) throw "invoice is missing"
        if (!invoice.buyer || !invoice.buyer.address) throw "invoice buyer is missing"
        if (!invoice.seller || !invoice.seller.address) throw "invoice seller is missing"

        if ( typeof data.confirmations !== "object" ) throw "confirmations missing"
        if ( typeof data.confirmations.buyer !== "object" ) throw "confirmations buyer missing"
        if ( typeof data.confirmations.seller !== "object" ) throw "confirmations seller missing"

        function getMessageToSignItems(){
            return LibertyTown.invoices.messageToSignItems( MyTextEncode( JSONStringify( { id: invoice.id, items: invoice.items, notes: invoice.notes, shipping: invoice.shipping })))
        }

        if ( (data.version.eq(0) && invoice.seller.multisig) || data.version.eq(1) ){
            if (typeof invoice.seller.recipient !== "string") throw "recipient is invalid"
            await LibertyTown.PandoraPay.addresses.decodeAddress(invoice.seller.recipient)
        }

        if (data.version.eq(0)) {
            if (invoice.id !== undefined) throw "invoice should not have id"

            const user = invoice.buyer.multisig ? 'buyer': 'seller'

            await LibertyTown.invoices.validate(JSONStringify({
                invoice,
                validateBuyer: !!invoice.buyer.multisig,
                validateBuyerSignature: !!invoice.buyer.multisig,
                validateSeller: !!invoice.seller.multisig,
                validateSellerSignature: !!invoice.seller.multisig,
            }))

            if (data.initialId !== invoice[user].nonce) throw "initialId missing"
        }

        if (data.version.gte(1)){
            invoice.id = await this.generateInvoiceId(invoice)
        }

        if (data.version.eq(1)) {

            const user = invoice.buyer.signature ? 'buyer': 'seller'
            const otherUser = invoice.buyer.signature ? 'seller': 'buyer'

            await LibertyTown.invoices.validate(JSONStringify({
                invoice, validateBuyer: true, validateSeller: true,
                validateBuyerSignature: !!invoice.buyer.signature, validateSellerSignature: !!invoice.seller.signature
            }))

            await LibertyTown.invoices.validate(JSONStringify({
                invoice: {
                    ...invoice,
                    buyer: {
                        address: invoice.buyer.address,
                        ... invoice.seller.signature ? {
                            multisig: invoice.buyer.multisig,
                            nonce: invoice.buyer.nonce,
                            conversionAsset: invoice.buyer.conversionAsset,
                            conversionAmount: invoice.buyer.conversionAmount,
                            signature: data.removedSignature,
                        } : {},
                    },
                    seller: {
                        address: invoice.seller.address,
                        ... invoice.buyer.signature ? {
                            recipient: invoice.seller.recipient,
                            multisig:  invoice.seller.multisig,
                            nonce:  invoice.seller.nonce,
                            signature: data.removedSignature,
                        } : {},
                    },
                }, validateBuyer: !!invoice.seller.signature, validateSeller: !!invoice.buyer.signature,
                validateBuyerSignature: !!invoice.seller.signature, validateSellerSignature: !!invoice.buyer.signature,
            }))

            if (data.initialId !== invoice[otherUser].nonce) throw "initialId missing"

            if (ValidatorHelper.validateSignature(data.confirmations[user].purchase)) throw "missing purchase signature"
            if (await LibertyTown.crypto.verify( await getMessageToSignItems(), Buffer.from( data.confirmations[user].purchase, "base64" ), invoice[user].address ) !== true) "purchase signature is invalid"

            if (ValidatorHelper.validateSignature(data.confirmations[user].delivery)) throw "missing delivery signature"
            if (await LibertyTown.crypto.verify( InvoiceUtils.messageToSignDelivery(invoice.id, invoice.delivery),  Buffer.from( data.confirmations[user].delivery, "base64" ), invoice[user].address ) !== true) "delivery signature is invalid"

            if (invoice.seller.signature) {
                if (ValidatorHelper.validateSignature(data.confirmations.seller.recipient)) throw "missing recipient signature"
                if (await LibertyTown.crypto.verify(await this.messageToSignRecipient(invoice.id, invoice.seller.recipient), Buffer.from(data.confirmations[user].recipient, "base64"), invoice[user].address) !== true) "recipient signature is invalid"
            }
        }

        if (data.version.gte(2) ) {
            await LibertyTown.invoices.validateConfirmed(JSONStringify({invoice}))
            if ( data.initialId !== undefined) throw "initialId should not exist anymore"

            for (const it of ["buyer", "seller"]){
                if (ValidatorHelper.validateSignature(data.confirmations[it].purchase)) throw "missing purchase signature"
                if (await LibertyTown.crypto.verify( await getMessageToSignItems(), Buffer.from( data.confirmations[it].purchase, "base64" ), invoice[it].address ) !== true) "data info signature is invalid"
                if (ValidatorHelper.validateSignature(data.confirmations[it].delivery)) throw "missing delivery signature"
                if (await LibertyTown.crypto.verify( InvoiceUtils.messageToSignDelivery(invoice.id, invoice.delivery),  Buffer.from( data.confirmations[it].delivery, "base64" ), invoice[it].address ) !== true) "delivery signature is invalid"
            }

            if (ValidatorHelper.validateSignature(data.confirmations.seller.recipient)) throw "missing recipient signature"
            if (await LibertyTown.crypto.verify( await this.messageToSignRecipient(invoice.id, invoice.seller.recipient), Buffer.from( data.confirmations.seller.recipient, "base64" ), invoice.seller.address ) !== true) "recipient signature is invalid"
        }

        if (data.version.gte(3)){
            if (ValidatorHelper.validateHash(data.tx)) throw "tx hash is invalid"
        }else if (typeof data.tx !== "undefined") throw "tx id should not exist"

        if (data.version.gte(4)){
            if (ValidatorHelper.validateSignature(data.confirmations.seller.confirmsTx)) throw "tx confirmation signature is wrong"
            await LibertyTown.crypto.verify( InvoiceUtils.messageToSignTxConfirmation( invoice.id, data.tx  ), Buffer.from( data.confirmations.seller.confirmsTx, "base64"), invoice.seller.address )
        }else if (typeof data.confirmations.seller.confirmsTx !== "undefined") throw "tx confirmation signature should not exist"

        if (data.version.gte(5)){
            if (typeof data.resolution !== "boolean") throw "resolution is missing"
            if (ValidatorHelper.validatePandoraPaySignature(data.resolutionSignature)) throw "resolution signature is invalid"
            if (await LibertyTown.invoices.multisig.verify(MyTextEncode( JSONStringify({
                txId: Buffer.from(data.tx, "hex").toString("base64"),
                payloadIndex: Decimal_0,
                resolution: data.resolution,
                multisigPublicKey: data.resolution ? invoice.buyer.multisig : invoice.seller.multisig,
                multisigSignature: data.resolutionSignature,
            }))) !== true) throw "signature is invalid"
        }

    },

    async validateListing(message) {
        try{
            if (!message.decrypted.data.listing) throw "listing is missing"
        }catch(e){
            message.error = e.toString()
        }
    }

}