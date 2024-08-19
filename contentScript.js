const template = document.createElement("template");
template.innerHTML = `
    <style>
        .dictionary{
            display: none;
            position: fixed;
            z-index: 1000;
            font-family: monospace;
            font-size: large;
            background-color: white;
            color: black;
            width: max-content;
            padding: 6px;
            border: 1px solid black;
            right: 0px;
            top: 50vh;
            -webkit-box-shadow: 0px 0px 25px 0px rgba(0,0,0,0.75);
            -moz-box-shadow: 0px 0px 25px 0px rgba(0,0,0,0.75);
            box-shadow: 0px 0px 25px 0px rgba(0,0,0,0.75);
        }

        .dictionary:hover{
            cursor: pointer;
        }
        
        .dictionary-wrapper{
            padding-top: 0;
            width: 100vw;
            max-width: 238px;
            max-height: 261px;
            min-height: 20vh;
            overflow-y: scroll;
        }

        .selected-word{
            position: sticky;
            top: 0;
            border: 2px solid black;
            background-color: white;
        }

        .definitions-container{
            height: 100%;
        }
        
        p{
            border: 1px solid black;
            padding: 2px;
        }

    </style>
    <div class="dictionary dictionary-icon">Show Definition</div>
    <div class="dictionary dictionary-wrapper">
        <h3 class="selected-word"></h3>
        <div class="definitions-container"></div>
    </div>
`;


const shadowHostDiv =  document.createElement("div");
shadowHostDiv.setAttribute("id", "dictionary");
document.body.appendChild(shadowHostDiv);
const shadowRoot = shadowHostDiv.attachShadow({ mode: "open" });
shadowRoot.appendChild(template.content.cloneNode(true));

const dictionaryIcon = shadowRoot.querySelector(".dictionary-icon");
const dictionaryWrapper = shadowRoot.querySelector(".dictionary-wrapper");
const selectedWordElement = shadowRoot.querySelector(".selected-word");
const definitionElementsContainer = shadowRoot.querySelector(".definitions-container");

let responseData;
let isDefinitionActive = false;

document.addEventListener("click", event => {
    if(event.target.id !== "dictionary"){
        dictionaryIcon.style.display = "none";
        dictionaryWrapper.style.display = "none";
        isDefinitionActive = false;
        removeDefinitionElements(definitionElementsContainer);
    }
})


dictionaryIcon.addEventListener("click", event => {
    isDefinitionActive = true;
    dictionaryIcon.style.display = "none";
    dictionaryWrapper.style.display = "block";

    selectedWordElement.textContent = responseData[0].word;
    
    const definitionsArray = responseData[0].meanings[0].definitions;
    const definitionElements = createDefinitionElements(definitionsArray);
    appendDefinitionElements(definitionElements, definitionElementsContainer);
})

document.addEventListener("mouseup", async event => {
    if(isDefinitionActive)return;
    const word = getSelectedWord();
    if (!word) return;
    const response = await chrome.runtime.sendMessage({
        queryWord: word,
    });
    if (response.error) return;
    responseData = response.data;
    dictionaryIcon.style.display = "block";
});


function createDefinitionElements(definitionsArray){
    let count = 1;
    const definitionElements = definitionsArray.map(definition => {
        const definitionElement = document.createElement("p");
        definitionElement.textContent = `${count}: ${definition.definition}`;
        count++;
        return definitionElement
    })
    return definitionElements;
}

function appendDefinitionElements(definitionElements, parentElement){
    definitionElements.map(definitionElement => {
        parentElement.appendChild(definitionElement);
    })
}

function removeDefinitionElements(parentElement){
    while (parentElement.firstChild) { 
        parentElement.firstChild.remove(); 
    }
}

function getSelectedWord() {
    let text = window.getSelection().toString().trim();
    const words = text.split(" ");
    if(words.length > 1 || words.length < 1)return;
    return text;
}
