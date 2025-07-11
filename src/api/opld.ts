import { request, requestUrl } from "obsidian"
//import data from "redundant/table.json";

interface LawBook {
    id: number,
    code: string, 
    slug: string,
    title: string, 
    revision_date: string,
    latest: boolean, 
    order: number
}

//const AllLawsTable: LawBook[] = data as LawBook[];

//const ApiKey = "api key"
const base_url = "https://www.gesetze-im-internet.de"
export class ApiWrapper {
    async search(book_code: string, query: string) {
        book_code = book_code.toLowerCase();
        try {
            const rawResponse = await request({
                url: `${base_url}/${book_code}/__${query}.html`,
                method: "GET", 
            });

            /** if (rawResponse.ok !== 200) {
                throw new Error(`Error: ${rawResponse.status}`);
            }*/
        
            //const json = await rawResponse.json();
            const parser = new DOMParser();
            const responseHtml = parser.parseFromString(rawResponse, "text/html");
            const textArea = responseHtml.getElementsByClassName("jnhtml");
            const lawText = textArea[0].innerHTML.toString().slice(5, -6)
            if (!lawText) return "Konnte nicht gefunden werden.";
            return lawText;

        } catch (error) {
            console.error(error.message);
            return "Konnte nicht gefunden werden.";
        }
    }
    async parseByLink(book_code: string, link: string){
        book_code = book_code.toLowerCase();
        try {
            const rawResponse = await request({
                url: `${base_url}/${book_code}/${link}`,
                method: "GET", 
            });

            /** if (rawResponse.ok !== 200) {
                throw new Error(`Error: ${rawResponse.status}`);
            }*/
        
            //const json = await rawResponse.json();
            const parser = new DOMParser();
            const responseHtml = parser.parseFromString(rawResponse, "text/html");
            const textArea = responseHtml.getElementsByClassName("jnhtml");
            const lawText = textArea[0].innerHTML.toString().slice(5, -6)
            if (!lawText) return "Konnte nicht gefunden werden.";
            return lawText;

        } catch (error) {
            console.error(error.message);
            return "Konnte nicht gefunden werden.";
        }
    }
    async previousLaw (book_code: string, query: string){
    book_code = book_code.toLowerCase();
        try {
            const rawResponse = await request({
                url: `${base_url}/${book_code}/__${query}.html`,
                method: "GET", 
            });

            /** if (rawResponse.ok !== 200) {
                throw new Error(`Error: ${rawResponse.status}`);
            }*/
        
            //const json = await rawResponse.json();
            const parser = new DOMParser();
            const responseHtml = parser.parseFromString(rawResponse, "text/html");
            const textArea:HTMLElement|null = responseHtml.getElementById("blaettern_zurueck")
            const prev = textArea?.children.item(0) as HTMLElement
            const previous = prev.getAttribute("href")?.slice(2, -5);
            
            if (!previous) return undefined;
            return previous;

        } catch (error) {
            console.error(error.message);
            return "Konnte nicht gefunden werden.";
        }
    }
    async nextLaw (book_code: string, query: string){
    book_code = book_code.toLowerCase();
        try {
            const rawResponse = await request({
                url: `${base_url}/${book_code}/__${query}.html`,
                method: "GET", 
            });

            /** if (rawResponse.ok !== 200) {
                throw new Error(`Error: ${rawResponse.status}`);
            }*/
        
            //const json = await rawResponse.json();
            const parser = new DOMParser();
            const responseHtml = parser.parseFromString(rawResponse, "text/html");
            const textArea:HTMLElement|null = responseHtml.getElementById("blaettern_weiter")
            const next = textArea?.children.item(0) as HTMLElement
            const nexter = next.getAttribute("href")?.slice(2, -5);
            
            if (!nexter) return undefined;
            return nexter;

        } catch (error) {
            console.error(error.message);
            return "Konnte nicht gefunden werden.";
        }
    }



    /**getIdbyName(slug: string) {
        const lawBook = AllLawsTable.find((law) => law.code === slug);
        if (lawBook) {
            return lawBook.id;
        } else {
            console.error(`Law book with slug ${slug} not found.`);
            return null;
        }
    }*/
}