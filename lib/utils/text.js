const
    IO = LIB('io')
,   FArray = LIB('faau').FArray
,   FObject = LIB('faau').FObject
,   results = new FObject()
,   ret = new FArray()
,   separatorRegex = /[,.!?+\/+\s*:()@]/gi
,   validatorRegex = /^[\w.-]+$/
,   lauthRegex = /(kk+)/g
;;

module.exports = class StringParser {

    static StringCount (folder) {
        try{
            const files = IO.scan(folder)
            // extraindo conteudo dos arquivos   
            FArray.instance(files).each(file => {
                const 
                    objs = IO.jout(folder + file)
                    // extraindo apenas o texto
                ,   contents = objs.content
                ,   array = []
                ;;
                array.push(contents.toString().toLowerCase())
            
                const filtered_array_words = array.map(phrase => phrase.split(separatorRegex)
                    .filter(word => validatorRegex.test(word))).flat()
                
                // atribui a palavra em um novo objeto contendo 
                // a palavra e o contador
                for (let i = 0; i <= filtered_array_words.length; i++ ){
                    if (!lauthRegex.test(filtered_array_words[i])) {
                        if (results[filtered_array_words[i]]){
                            results[filtered_array_words[i]]++
                        } else {
                            results[filtered_array_words[i]] = 1
                        }
                    }
                }

                // Atribui o item em formato chave e valor no Ret
                results.each(item => { 
                    if(item.value > 1) {
                        ret.push({ word: item.key, count: item.value })   
                    }
                })                
            })
        }
        catch (error) {
            IO.log('StringParser::StringCount > ' + JSON.stringify(error), 'analise-error.log');
        }

        ret.sort(function (a, b) { return a.count - b.count * 1})
        return this.rmObjDuplicated(ret, item => item.word)
    }

    // função para criar uma cópia do array final e comparar a valor da chave
    // duplicada
    static rmObjDuplicated (data, key){
        return [...new Map(data.map(item => [key(item), item])).values()]
    }
}