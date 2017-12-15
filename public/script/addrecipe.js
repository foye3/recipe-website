var ingredientCounter = 1;
var stepCounter = 1;
var limit = 10;
function addInputs(divname) {
    if (ingredientCounter == limit) {
        alert("You have reached the limit of adding " + ingredientCounter + " inputs");
    }
    else {
        let html;
        switch (divname) {
            case "ingredientsdiv":
                html = 
                `<div class = "form-group">
                    <div  class="col-sm-5">
                        <input type="text" name="ingredient[]" placeholder="ingredient${ingredientCounter+1}" class="form-email form-control" id="#" required>
                    </div>
            
                    <div class="col-sm-4">
                        <input type="text" name="amounts[]" placeholder="amount" class="form-email form-control" id="#" required>
                    </div>
                </div>`;
                ingredientCounter++;
                break;
            case "stepsdiv":
                html = `<div class = "form-group">
                <label class="sr-only" for="steps[]">steps</label>
                <div class="col-sm-9">
                    <input type="text" name="steps[]" placeholder=" step${stepCounter+1} " class="form-email form-control" id="#">
                </div>
                </div>`;
                stepCounter++;
                break;
        }
        //alert(html);
            var newdiv = document.createElement('div');
            newdiv.innerHTML = html;
            document.getElementById(divname).appendChild(newdiv);
            // ingredientCounter++;

 
    }
}
function removeInputs(divName){
    if(divName == "ingredientsdiv"){
        if(ingredientCounter == 1){
            alert("We need some ingredents");
        }
        else{
            // let html;
            // switch(divName){
            //     case "ingredientsdiv":
            //     ""
            //     break;
            // }
            var my = document.getElementById(divName);
            if (my != null){
                my.removeChild(my.lastChild);
            }
            ingredientCounter--;
    
        }
    }
    else {
        if(stepCounter == 1){
            alert("We need some steps to cook");
        }
        else{
            // let html;
            // switch(divName){
            //     case "ingredientsdiv":
            //     ""
            //     break;
            // }
            var my = document.getElementById(divName);
            if (my != null){
                my.removeChild(my.lastChild)
            }
            stepCounter--;
    
        }
    
    }
}
