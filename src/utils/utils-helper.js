export default {
    bigNumberInList(number, list = []){

        for (const it of list)
            if (number.eq(it)) return true

        return false
    },

    serialize(obj, prefix) {
        var str = [], p;
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                const k = prefix ? prefix : p
                const v = obj[p];
                str.push((v !== null && typeof v === "object") ?
                    this.serialize(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    }
}