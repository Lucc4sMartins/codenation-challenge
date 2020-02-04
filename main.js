const fetch = require('node-fetch')
const sha1 = require('sha1')
const fs = require('fs')
const FormData = require('form-data')
const TOKEN = 'YOUR_TOKEN_HERE'
const requestUrls = {
    generateData: 'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=',
    submitSolution: 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token='
}
const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

const julioCesarDecrypt = (index, message) => {
    const messageArray = message.split('')
    
    return messageArray.map(currentChar => {
        if (!alphabet.includes(currentChar)) return currentChar

        const letterIndex = alphabet.indexOf(currentChar)
        let decryptedLetterIndex = letterIndex - index

        if (decryptedLetterIndex < 0) {
           decryptedLetterIndex = alphabet.length + decryptedLetterIndex
        }

        return alphabet[decryptedLetterIndex]
    }).join('')
}

fetch(`${requestUrls.generateData}${TOKEN}`)
    .then(res => res.json())
    .then(res => {
        if (res.error) throw res

        const { cifrado, numero_casas, token } = res
        const decryptedMessage = julioCesarDecrypt(numero_casas, cifrado.toLowerCase())
        const sha1EncryptedResume = sha1(decryptedMessage)

        const challengeResult = {
            numero_casas,
            token,
            cifrado,
            decifrado: decryptedMessage,
            resumo_criptografico: sha1EncryptedResume
        }

        fs.writeFileSync('answer.json', JSON.stringify(challengeResult))

        const body = new FormData()
        body.append('answer', fs.readFileSync('answer.json'), 'answer.json')

        fetch(`${requestUrls.submitSolution}${TOKEN}`, { method: 'POST', body })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw res

                console.log(res)
            })
    })
    .catch(err => {
        console.error('Something went wrong! \n', err)
    })