const danfo = require("danfojs-node")
const prompt = require("prompt-sync")()

class Person {
    
    married = undefined
    preferences = []
    name = ""
    
    constructor(name, possible) {
        this.name = name
        this.preferences = [...possible].sort(a => .5 - Math.random())
        this.married = undefined
    }

    marry(name) {
        const prefIdx = this.preferences.indexOf(name)
        if (prefIdx < this.preferences.indexOf(this.married) || this.married == undefined) {
            if(this.married) people[this.married].married = undefined
            this.married = name
            return true
        }
        return false
    }

    proposeAll() {
        for(const pref of this.preferences) {
            if (people[pref].marry(this.name)) {
                console.log(`${this.name} married ${pref}`)
                this.married = pref
                break
            }
        }
    }
}

const women_def = [
    "Lisa",     // 1
    "Chloe",    // 2
    "Bethany",  // 3
    "Rebecca",  // 4
    "Charlie",  // 5
    "Dianna",   // 6
    "Elizabeth" // 7
]
const men_def = [
    "Bob",     // 1
    "Steven",  // 2
    "Stephen", // 3
    "Carck",   // 4
    "Neat",    // 5
    "John",   // 6
    "Jack",   // 7
]

let men = [

]
let women = [

]

const people = {}

function setupPeople() {
    for(const m of men) {
        people[m] = new Person(m, women)
    }
    for(const w of women) {
        people[w] = new Person(w, men)
    }
}

async function start() {
    const couplesAmount = prompt("How many couples would you like to make? > ")
    const csv = await danfo.readCSV("./names.csv")
    csv.column("name").dropDuplicates()

    women = csv.values.filter(val => val[3] == "girl").map(w => w[1])
    men = csv.values.filter(val => val[3] == "boy").map(m => m[1])
    women.length = Math.min(csv.values.length, couplesAmount)
    men.length = Math.min(csv.values.length, couplesAmount)


    //console.log(men)
    //console.log(women)

    setupPeople()
    let matching = true
    while (matching) {
        const peopleAvailable = women.filter(w => people[w].married == undefined)

        if(peopleAvailable.length <= 0) matching = false

        for(const p of peopleAvailable) {
            people[p].proposeAll()
        }
    }
    for(const w of women) {
        console.log(`Name: ${w}\nMatched: ${people[w].married}\n
        `)
        // Prefs: ${people[w].preferences.join(", ")}
        for(const w1 of women) {
            if (w1 != w && people[w1].married == people[w].married){
                console.log(`W: ${w} ${people[w].married}   W1: ${w1} ${people[w1].married}`)
                console.log("Something has gone wrong!")
                break
            }
        }
        if(people[w].married != people[w].preferences[0] && people[people[w].preferences[0]].preferences[0] == w) {
            console.log("How has this happened?")
            break
        }
        //console.log(`
        //W: ${w} matched with M: ${people[w].married}, M pref was ${people[people[w].married].preferences[0]}, M prefs pref was ${people[people[people[w].married].preferences[0]]}
        //`)
    }

}

start()

