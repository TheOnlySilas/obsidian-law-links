
import data from "./redundant/table.json";



export function convertfromRomanToNumber(num:string){
    let res = 0;
    console.log("test", num);

    for (let i = 0; i < num.length; i++) {
        // Getting value of symbol s[i]
        let s1 = value(num.charAt(i));

        // Getting value of symbol s[i+1]
        if (i + 1 < num.length) {
            let s2 = value(num.charAt(i + 1));

            // Comparing both values
            if (s1 >= s2) {
                // Value of current symbol
                // is greater or equalto
                // the next symbol
                res = res + s1;
            }
            else {
                // Value of current symbol is
                // less than the next symbol
                res = res + s2 - s1;
                i++;
            }
        }
        else {
            res = res + s1;
        }
    }
    return res;
}

function value(r:string) {
    if (r == 'I')
        return 1;
    if (r == 'V')
        return 5;
    if (r == 'X')
        return 10;
    if (r == 'L')
        return 50;
    if (r == 'C')
        return 100;
    if (r == 'D')
        return 500;
    if (r == 'M')
        return 1000;
    return -1;
}

export function testBookCode (slug:string) {
        slug.toUpperCase();
        const lawBook = data.find((law) => law.code === slug);
        if (lawBook) {
            return lawBook;
        } else {
            console.error(`Law book with slug ${slug} not found.`);
            return null;
        }
    }