/*width and height*/
var w = 600;
var h = 600;
var padding = 40;


var dataset=[];



d3.json("datapoint.json").then(function(data){

    //carico tutto dentro la funzione d3.json perchè è asincrona
    //altrimenti la variabile dataset non verrebbe utilizzata


    //Da qui algoritmo per creare dataset e assegnare un colore diverso per ogni datapoint
    //ai datapoint "duplicati" viene assegnato lo stesso colore
    let i =0;
    let id=0;

    var duplicati=[]


    for(let i=0;i<data.length;i++){
        for(let j=i+1;j<data.length;j++){

            //se è un "duplicato"
            if( (data[i]["x"]===data[j]["y"] && data[i]["y"]===data[j]["x"] ) ||
                (data[i]["x"]===data[j]["x"] && data[i]["y"]===data[j]["y"] )  ){
                duplicati.push(data[j]); //push duplicato alla lista
                data.splice(data.indexOf(data[j]),1);  //rimuovi l'elemento "duplicato"
                j--; //decrementa j perchè hai rimosso un elemento dall'array
            }
        }
    }

    var colori=0;

    //scorro gli elementi di data e controllo se questi hanno un duplicato, se ce l'hanno aggiungo il duplicato
    //al dataset e do lo stesso colore a tutti i duplicati
    for(let i=0;i<data.length;i++){
        for(let j=0;j<duplicati.length;j++){
            if((data[i]["x"]===duplicati[j]["y"] &&  data[i]["y"]===duplicati[j]["x"] ) ||
                (data[i]["x"]===duplicati[j]["x"] && data[i]["y"]===duplicati[j]["y"] )){

                dataset.push([duplicati[j]["x"],duplicati[j]["y"],d3.interpolateSinebow(colori),id]);
                duplicati.splice(duplicati.indexOf(duplicati[j]),1);
                j--;
                id++;
            }
        }
        dataset.push([data[i]["x"],data[i]["y"],d3.interpolateSinebow(colori),id]);
        colori+=1/data.length;
        id++;
    }
    //fine creazione dataset


    //Da qui implementazione dello scatterplot

    var x_max= d3.max(dataset, function(d) { return d[0]; });
    var y_max= d3.max(dataset, function(d) { return d[1]; });
    var x_y_max= Math.max(x_max,y_max);


    //scale function
    var xScale = d3.scaleLinear()
        .domain([0, x_y_max])       //come dominio asse x considero il massimo dell'asse x e y
        .range([padding, w - padding]);

    var yScale = d3.scaleLinear()
        .domain([0, x_y_max])      //come dominio asse y considero il massimo dell'asse x e y
        .range([h - padding, padding]);

    var xAxis = d3.axisBottom().scale(xScale).ticks(30);

    var yAxis = d3.axisLeft().scale(yScale).ticks(30);

var isClickable=true; //serve per bloccare il click durante la transizione

//create svg element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);


    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d[0]);
        })
        .attr("cy", function(d) {
            return yScale(d[1]);
        })
        .attr("r", 5)
        .attr("id", function(d)
            { return d[3]; })

        .attr("fill", function(datapoint){  //selectAll viene ripetuta per tutti gli elementi del dataset
              return datapoint[2];          //datapoint ogni volta è un elemento differente del dataset

        })


        .on("click", function(){
            if(isClickable) {
                isClickable=false;
                let clicked = d3.select(this);
                let clicked_id = clicked.attr("id"); //prendo id del circle su cui ho cliccato


                dataset.forEach(function (element) {

                    if (element[3]!=clicked_id) { //se l'id dell'elemento nel dataset è diverso da quello su cui ho cliccato
                                                 //scambiali, altrimenti lascialo così
                        let new_x = element[1];
                        let new_y = element[0];
                        element[0] = new_x;     //eseguo lo scambio di x e y
                        element[1] = new_y;

                    }
                })


                // Update all circles
                svg.selectAll('circle')
                    .data(dataset)
                    .transition() // Transition 1 -> spostamento dei circle
                    .duration(1000)
                    .attr('cx', function (d) {
                        return xScale(d[0]);
                    })
                    .attr('cy', function (d) {
                        return yScale(d[1]);
                    })
                    .attr('r', 5)

                    .on("end", function () {
                        isClickable=true;
                    })
            }
        });


//x axis
    svg.append("g")   //g means group
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (h-padding) + ")")  //mette asse x sotto,  0  560
        .call(xAxis);

//y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ", 0)")       //da 40 a 0
        .call(yAxis);

});


