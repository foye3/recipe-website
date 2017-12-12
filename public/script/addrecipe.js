var counter = 1;
var limit = 30;
function addInputs(divname) {
    if (counter == limit) {
        alert("You have reached the limit of adding " + counter + " inputs");
    }
    else {
        let html;
        switch (divname) {
            case "ingredientsdiv":
                html = 
                "<br><label>ingredient: </label><input type='text' name='ingredients[]'/><label> ammount: </label><input type='text' name='amounts[]' />";
                break;
            case "stepsdiv":
                html = "<br><label> steps: </label><input type='text' name='steps[]'>"
                break;
        }
        //alert(html);
        var newdiv = document.createElement('div');
        newdiv.innerHTML = html;
        document.getElementById(divname).appendChild(newdiv);
        counter++;
    }
}
