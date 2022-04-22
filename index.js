const danfo = require("danfojs-node")
const prompt = require("prompt-sync")()

class Person {
    spouse = undefined
    preferences = {}
    possible = []
    name = ""
    topPreference = ""

    constructor(name, possible) {
        this.name = name

        // Pseudo-randomise array as a way of generating preferences
        possible = possible.sort(a => .5 - Math.random())
        this.topPreference = possible[0]
        for(let i = 0; i < possible.length; i++) {
            this.preferences[possible[i]] = i
        }

        this.possible = [...possible]
    }
}

class Male extends Person {
    constructor(name, possible) {
        super(name, possible)
    }

    // Attempt to marry the given name
    // Will fail if the name ranks lower in the persons preferences than the currently married person
    marry(name) {
        const marriedRank = this.preferences[this.spouse]
        const prefIdx = this.preferences[name]
        if (prefIdx < marriedRank || this.spouse == undefined) {
            if(this.spouse) Females[this.spouse].spouse = undefined
            this.spouse = name
            return true
        }
        return false
    }
}

class Female extends Person {
    constructor(name, possible) {
        super(name, possible)
    }

    // Attempt to marry all people in preferences
    // Will end after successfully marrying someone
    proposeAll() {

        for(const m_key of this.possible) {
            const m_pref = this.preferences[m_key]
            console.log(`\n${this.name} preference of ${m_key} is ${m_pref}`)
            console.log(`${m_key} preference of ${this.name} is ${Males[m_key].preferences[this.name]}`)
            if(Males[m_key].marry(this.name)) {
                console.log(`${this.name} married ${m_key}\n`)
                this.spouse = m_key
                break
            }
            else {
                // Remove male from preference list to reduce iterations in further stages
                delete this.preferences[m_key]
                this.possible.splice(m_pref, 1)
            }
        }
    }
}

// Default list of womens names for testing
const women_def = [
    "Lisa",     // 1
    "Chloe",    // 2
    "Bethany",  // 3
    "Rebecca",  // 4
    "Charlie",  // 5
    "Dianna",   // 6
    "Elizabeth" // 7
]

// Default list of mens names for testing
const men_def = [
    "Bob",     // 1
    "Steven",  // 2
    "Stephen", // 3
    "Carck",   // 4
    "Neat",    // 5
    "John",   // 6
    "Jack",   // 7
]

let male_names = []
let female_names = []

// Dictionary of <string, Male> key-value pairs
const Males = {}
// Dictionary of <string, Female> key-value pairs
const Females = {}

async function start() {

    // Get required couples
    const couplesAmount = prompt("How many couples would you like to make? > ")

    // Load names
    const csv = await danfo.readCSV("./names.csv")

    console.log(`${csv.values.length} total names.`)

    // Create arrays of womens/mens names by filtering name values
    female_names = csv.values.filter(val => val[3] == "girl").map(w => w[1])
    male_names = csv.values.filter(val => val[3] == "boy").map(m => m[1])

    // Remove duplicates
    female_names = [...new Set(female_names)]
    male_names = [...new Set(male_names)]

    const len = Math.min(couplesAmount, female_names.length, male_names.length)

    // Set array length to the minimum of csv.values.length or couplesAmount
    female_names = female_names.slice(0, len)
    male_names = male_names.slice(0, len)

    console.log(`Men ${male_names.length} | Women ${female_names.length}`)

    // Create Person instances for each name
    for(const m of male_names) {
        Males[m] = new Male(m, female_names)
        console.log("Created male object for " + m)
    }
    for(const w of female_names) {
        Females[w] = new Female(w, male_names)
        console.log("Created female object for " + w)
    }


    // Main algorithm loop
    let matching = true
    while (matching) {

        // Get all currently unmarried women by checking whether their married property is set to undefined
        const peopleAvailable = female_names.filter(w => Females[w].spouse == undefined)
        console.log(`There are ${peopleAvailable.length} unmarried women left.`)

        // End loop if there are no unmarried women
        if(peopleAvailable.length <= 0) matching = false

        // Iterate over each unmarried woman and try to propose to each preference
        for(const p of peopleAvailable) {
            console.log(`Proposing to all preferences of ${p}`)
            Females[p].proposeAll()
        }
    }

    console.log("Finished running algorithm.")

    // End of algo output
    for(const w of female_names) {
        const wObj = Females[w]
        console.log(`\nName: ${w}\nMarried: ${wObj.spouse}\nTop: ${wObj.topPreference}`)

        // Checks for duplicate married values
        for(const w1 of female_names) {
            if (w1 != w && Females[w1].spouse == Females[w].spouse){
                console.log(`W: ${w} ${Females[w].spouse}   W1: ${w1} ${Females[w1].spouse}`)
                console.log("Something has gone wrong!")
                return
            }
        }

        // Checks for unstable marriages 
        const f_top = wObj.topPreference
        if(wObj.topPreference != wObj.spouse && Males[f_top].topPreference == w) {
            console.log("How has this happened?")
            console.log(wObj.preferences[wObj.spouse], Males[f_top].preferences[wObj.name])
            break
        }
    }

}

start()

