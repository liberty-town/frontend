export default {

    validateHex (data, length, title = 'Input')  {

        if (! /^[a-fA-F0-9]+$/.test(data))
            return `${title} is invalid. It should be Hex encoded.`

        if (length !== undefined && Buffer.from(data, "hex").length !== length)
            return `${title} size is invalid`

        return ""
    },

    validateBase64 (data, length, title = 'Input') {

        if (! /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(data))
            return `${title} is invalid. It should be Base64 encoded.`

        if (length !== undefined && Buffer.from(data, "base64").length !== length)
            return `${title} size is invalid`

        return ""
    },

    validateHash (data)  {
        return this.validateHex(data, LibertyTown.crypto.HASH_SIZE, "Hash")
    },

    validateHashBase64 (data)  {
        return this.validateBase64(data, LibertyTown.crypto.HASH_SIZE, "Hash")
    },

    validateSignature (data) {
        return this.validateBase64(data, LibertyTown.crypto.SIGNATURE_SIZE, "Signature")
    },

    validatePublicKey (data) {
        return this.validateBase64(data, LibertyTown.crypto.PUBLIC_KEY_SIZE, "Public Key")
    },

    validatePandoraPayAsset (data){
        return this.validateHex(data, LibertyTown.PandoraPay.config.coins.ASSET_LENGTH, "Asset")
    },

    validatePandoraPaySignature (data) {
        return this.validateBase64(data, LibertyTown.PandoraPay.cryptography.SIGNATURE_SIZE, "Signature")
    },

    validatePandoraPayPublicKey (data) {
        return this.validateBase64(data, LibertyTown.PandoraPay.cryptography.PUBLIC_KEY_SIZE, "Public Key")
    },

    validateNumber (number, min, max) {

        const n = Number.parseInt(number, 10)
        if (number != n) return "Number is invalid"

        if (typeof min !== "undefined" && n < min) return `Number should be bigger than ${min}`
        if (typeof max !== "undefined" && n > max) return `Number should be smaller than ${max}`

        return ""
    },

}