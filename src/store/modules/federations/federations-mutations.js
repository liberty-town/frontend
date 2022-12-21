export default {

    setFederations(state, federations){
        for (const key in federations){
            const fed = federations[key]

            let sorted = []
            const categoriesDict = {}
            const categoriesByTextDict = {}

            const process = (category, left) => {

                const newCat = {name: category.n, text:category.n, left: left, value: category.id }
                sorted.push(newCat)
                categoriesDict[category.id] = newCat
                categoriesByTextDict[category.n.toLowerCase()] = newCat

                if (category.sub)
                    for (const cat of category.sub)
                        process(cat, left+5)
            }

            for (const cat of fed.categories)
                process(cat, 0)

            fed.categoriesList = sorted
            fed.categoriesDict = categoriesDict
            fed.categoriesByTextDict = categoriesByTextDict
        }
        state.dict = federations
    },

    setSelectedFederation(state, selectedFederation){
        state.selected = selectedFederation
    },
}