export default {

    invoiceInfo(data, type, whoAmI, whoIsTheOther){

        if (!data || !type.eq(3) ) return ""

        const invoice = data.invoice

        switch (data.version.toNumber()){
            case 0:
                if (whoAmI && !invoice[whoAmI].signature) return {text:  "You need to Accept Draft Invoice", badge: "bg-warning", icon:"fas fa-triangle-exclamation" }
                else return {text: `Wait ${whoIsTheOther} to accept invoice`, badge: "bg-secondary"}
            case 1:
                if (whoAmI && !invoice[whoAmI].signature) return {text:  'You need to Confirm Invoice', badge: "bg-warning", icon:"fas fa-triangle-exclamation"}
                else return {text:`Wait ${whoIsTheOther} to confirm`, badge: "bg-secondary"}
            case 2:
                if (whoAmI === 'buyer') return {text: 'You need to Pay Invoice', badge: "bg-warning", icon:"fas fa-triangle-exclamation" }
                else return {text: `Wait ${whoIsTheOther} to pay`, badge: "bg-secondary"}
            case 3:
                if (whoAmI === 'buyer') return {text: `Waiting ${whoIsTheOther} to confirm payment`, badge: "bg-info" }
                else return {text: `You need to confirm Payment`, badge: "bg-warning", icon:"fas fa-triangle-exclamation"}
            case 4:
                if (whoAmI === 'buyer') return {text: `Confirm goods when received`, badge: "bg-danger", icon:"fas fa-triangle-exclamation" }
                else return {text: `Ship the items`, badge: "bg-warning", icon:"fas fa-triangle-exclamation" }
            case 5:
                if (whoAmI === 'buyer') {
                    if (data.resolution) return {text: `Wait ${whoIsTheOther} to claim payment`, badge: "bg-info"}
                    else return {text: `Claim refunds`, badge: "bg-warning", icon:"fas fa-triangle-exclamation" }
                }
                else if (whoAmI === 'seller') {
                    if (data.resolution)  return {text: `Claim payment`, badge: "bg-warning", icon:"fas fa-triangle-exclamation" }
                    else return {text: `Wait ${whoIsTheOther} to claim refunds`, badge: "bg-info" }
                }else return {text: `Wait ${data.resolution ? 'seller claim payment' : 'buyer claim refunds'}`, badge: "bg-info" }
            case 6:
                if (whoAmI === 'buyer') {
                    if (data.resolution) return {text: `${whoIsTheOther} claimed payment`, badge: "bg-info", icon:"fas fa-check" }
                    else return {text: `You claimed refunds`, badge: "bg-info", icon:"fas fa-check" }
                }
                else if (whoAmI === 'seller') {
                    if (data.resolution)  return {text: `You claimed payment`, badge: "bg-success", icon:"fas fa-check" }
                    else return {text: ` ${whoIsTheOther} claimed refunds`, badge: "bg-info", icon:"fas fa-check" }
                }else return {text: `${data.resolution ? 'seller claimed payment' : 'buyer claimed refunds'}`, badge: "bg-info", icon:"fas fa-check"}
        }

    },

    reviewInfo(data, type, whoAmI, whoIsTheOther){

        if (!data || !type.eq(4)) return

        switch (data.version.toNumber()){
            case 0:
                if (whoAmI === "buyer" || whoAmI === "seller") return {text:  `Waiting for ${whoIsTheOther} to review request`, badge: "bg-secondary" }
                else return {text: `You need to process the review`, badge: "bg-warning", icon:"fas fa-triangle-exclamation"}
            case 1:
                if (whoAmI === "buyer" || whoAmI === "seller") {
                    if (data.info.rejected) return {text:  "Review was rejected", badge: "bg-secondary", icon: "fas fa-times" }
                    if (data.info.processed) return {text:  "Review was processed", badge: "bg-secondary", icon: "fas fa-check" }
                }
                else return {text: `Processed already`, badge: "bg-secondary", icon:"fas fa-check"}
        }
    },

    disputeInfo(data, type, whoAmI, whoIsTheOther){

        if (!data || !type.eq(5) ) return ""

        switch (data.version.toNumber()){
            case 0:
                if (whoAmI === "buyer" || whoAmI === "seller") return {text:  `Waiting for ${whoIsTheOther} to review request`, badge: "bg-secondary" }
                else return {text: `You need to process the review`, badge: "bg-warning", icon:"fas fa-triangle-exclamation"}
            case 1:
                if (whoAmI === "buyer" || whoAmI === "seller") {
                    if (data.info.rejected) return {text:  "Review was rejected", badge: "bg-secondary", icon: "fas fa-times" }
                    if (data.info.processed) return {text:  "Review was processed", badge: "bg-secondary", icon: "fas fa-check" }
                }
                else return {text: `Processed already`, badge: "bg-secondary", icon:"fas fa-check"}
        }
    }

}