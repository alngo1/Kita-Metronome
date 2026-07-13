function addOnClicksForAdjusters(containerSelector){
    let container = document.body.querySelector(containerSelector);
    if(container.children.length != 6){
        return;
    }
    const addToInput = (val) => {
        let input = document.body.querySelector(`${containerSelector} > input`);
        input.value = input.value + val;
    };
    container.children[0].onclick = () => {addToInput(-10)};
    container.children[1].onclick = () => {addToInput(-1)};
    container.children[4].onclick = () => {addToInput(1)};
    container.children[5].onclick = () => {addToInput(10)};

    console.log(container.children);
}
addOnClicksForAdjusters(".bpm-container");
addOnClicksForAdjusters(".offset-container");