const { it, expect } = require("@jest/globals");
const orderTotal = require("./order-total");

// it('works', () => {
//     expect(1).toBe(2);
// })

it.only('calls vatapi.com correctly', () => {
    const fakeProcess = {
        env: {
            VAT_API_KEY: 'key123'
        }
    }
    const fakeFetch = (url, opts) => {
        expect(opts.headers.apikey).toBe('key123')
        expect(url).toBe('https://vatapi.com/v1/country-code-check?code=DE')
        return Promise.resolve({
            json: () => Promise.resolve({
                rates: {
                    standard: {
                        value: 19
                    }
                }
            })
        })
    }
    const fakeFetch2 = jest.fn().mockReturnValues(Promise.resolve({
        json: () => Promise.resolve({
            rates: {
                standard: {
                    value: 19
                }
            }
        })
    }))
    return orderTotal(fakeFetch2, fakeProcess, {
        country: 'DE',
        items: [
            { 'name': 'Dragon waffles', price: 20, quantity: 2 }
        ]
    }).then(result => { 
        expect(result).toBe(20*2*1.19);
        expect(fakeFetch).toBecalledWith(
            'https://vatapi.com/v1/country-code-check?code=DE',
            {
                "headers": {"apikey": "key123"} 
            } 
        )
    })
})

it('Quantity', () => 
    orderTotal(null, null, {
        items: [
            { 'name': 'Dragon candy', price: 2, quantity: 3 }
        ]
    }).then(result => expect(result).toBe(6)))

it('No quantity specified', () =>
    orderTotal(null, null, {
        items: [
            { 'name': 'Dragon candy', price: 3 }
        ]
    }).then(result => expect(result).toBe(3)))

it('Happy path (Example 1)', () =>
    orderTotal(null, null, {
        items: [
            { name: 'Dragon food', price: 8, quantity: 1 },
            { name: 'Drgaon cage (small)', price: 800, quantity: 1 }
        ]
    }).then(result => expect(result).toBe(808)));

it('Happy path (Example 2)', () =>
    orderTotal(null, null, {
        items: [
            { name: 'Dragon food', price: 20, quantity: 1 },
            { name: 'Drgaon cage (small)', price: 40, quantity: 1 }
        ]
    }).then(result => expect(result).toBe(60)));