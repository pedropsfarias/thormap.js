L.thorMap = {

    __control__: null,
    readyToFind: false,

    supportedFormats: function () {
        f = ["thorJson", "imagesTiles", "geoJson"];
        r = "Formats: ";
        for (var q = 0; q < f.length; q++) { r += f[q] + " "; }
        // console.log(r);
    },

    loadMap: function (params) {

        /* Guarda a estrutura de dados passa em params na variavel de controle '__control__' */
        this.__control__ = params;
        this.readyToFind = false;

        /* Define todas as camadas como invisiveis 'display:false'"*/
        for (var i = 0; i < this.__control__.length; i++) {
            this.__control__[i].display = false;

            if (this.__control__[i].label) {
                this.__control__[i].label.display = false;
            }
        }

        this._loadData();
        this._loadLabel();

    },

    _loadData: function () {

        // console.log("_loadData")

        /* Se há dados em controle */
        if (this.__control__) {
            // console.log("Existe controle")

            /* le as entradas do controle */
            for (var i = 0; i < this.__control__.length; i++) {

                /* Se existe um mapa definido dentro do controle, continua */
                if (this.__control__[i].map) {

                    /* Avaliação do zoom */
                    if ((!this.__control__[i].minZoom || !this.__control__[i].maxZoom) ||
                        ((this.__control__[i].map.getZoom() >= this.__control__[i].minZoom) &&
                            (this.__control__[i].map.getZoom() <= this.__control__[i].maxZoom))) {
                        // console.log(" → Zoom ok. Vai pintar.")


                        /* Se não está no mapa */
                        if (!this.__control__[i].display) {
                            //console.log(" # " + this.__control__[i].name + " não está no mapa. Vai pintar.")

                            /* Se é "tileLayer"*/
                            if (this.__control__[i].type == "tileLayer") {

                                // console.log(" → É tileLayer")

                                // console.log(" → Add Dados no feature layer")
                                /* Cria um featureLayer para essa camada */
                                this.__control__[i].__featureLayer__ = this.initLayer(this.__control__[i].map, this.__control__[i].__featureLayer__);
                                this.__control__[i].data.addTo(this.__control__[i].__featureLayer__);

                                /* Se addToMap é true ou indefinido */
                                if (typeof this.__control__[i].addToMap == 'undefined' || this.__control__[i].addToMap == true) {
                                    // console.log(" → Add to map")
                                    this.__control__[i].__featureLayer__.addTo(this.__control__[i].map);
                                    this.__control__[i].display = true;
                                }

                                if (this.__control__[i].onDraw) {
                                    // console.log(" → Entrou onDraw")
                                    this.__control__[i].onDraw(this);
                                }
                            }
                            /* Se é "thorJson*/
                            else if (this.__control__[i].type == "thorJson") {

                                // console.log(" → É thorJson")

                                /* Cria um featureLayer para essa camada */
                                this.__control__[i].__featureLayer__ = this.initLayer(this.__control__[i].map, this.__control__[i].__featureLayer__);


                                numDf = this.__control__[i].df;
                                numAndar = this.__control__[i].gr;

                                umDf = this.__control__[i].data[numDf];
                                dadosDf = umDf["features"];
                                umAndar = dadosDf[numAndar];
                                dadosAndar = umAndar["features"];

                                for (var j = dadosAndar.length - 1; j >= 0; j--) {
                                    umaCamada = dadosAndar[j];
                                    dadosCamada = umaCamada["features"];
                                    pUmaCamada = umaCamada["properties"];

                                    for (var k = 0; k < dadosCamada.length; k++) {


                                        /* Dado do tipo ponto */
                                        if (dadosCamada[k].geometry.type == "Point") {



                                            /* Add geometria */
                                            dc = L.geoJson(dadosCamada[k], {
                                                pointToLayer: function (feature, latlng) {

                                                    if (pUmaCamada["properties"].iconUrl == "circle") {

                                                        style = { color: pUmaCamada["properties"].color, weight: 0, opacity: 1, fillColor: pUmaCamada["properties"].color, fillOpacity: 1 }
                                                        raio = 2 * (JSON.parse(pUmaCamada["properties"].iconSize))[0];

                                                        return L.circleMarker(latlng, style).setRadius(raio)
                                                    }
                                                    else {

                                                        return L.marker(latlng, { icon: L.icon(pUmaCamada["properties"]) });
                                                    }

                                                },
                                                onEachFeature: this.__control__[i].onEachFeature
                                            }).addTo(this.__control__[i].__featureLayer__);
                                        }
                                        else {
                                            dc = L.geoJson(dadosCamada[k], {
                                                style: pUmaCamada["properties"],
                                                onEachFeature: this.__control__[i].onEachFeature
                                            }).addTo(this.__control__[i].__featureLayer__);
                                        }
                                    }
                                }

                                /* Se addToMap é true ou indefinido */
                                if (typeof this.__control__[i].addToMap == 'undefined' || this.__control__[i].addToMap == true) {
                                    // console.log(" → Add to map")

                                    this.__control__[i].__featureLayer__.addTo(this.__control__[i].map);
                                    this.__control__[i].display = true;
                                }

                                if (this.__control__[i].onDraw) {
                                    // console.log(" → Entrou onDraw")
                                    this.__control__[i].onDraw(this);
                                }


                            }
                            /* Se é "geojson"*/
                            else if (this.__control__[i].type == "geoJson") {

                                // console.log(" → É geoJson")


                                this.__control__[i].__featureLayer__ = this.initLayer(this.__control__[i].map, this.__control__[i].__featureLayer__)

                                umaCamada = this.__control__[i].data;
                                dadosCamada = umaCamada["features"];
                                pUmaCamada = { properties: { iconUrl: "circle" } }


                                for (var k = 0; k < dadosCamada.length; k++) {

                                    //console.log(dadosCamada[k].properties)

                                    if (!dadosCamada[k].properties.style) {

                                        if (dadosCamada[k].geometry.type == "Point") {
                                            dc = L.geoJson(dadosCamada[k], {
                                                pointToLayer: function (feature, latlng) {
                                                    return L.marker(latlng);
                                                },
                                                onEachFeature: this.__control__[i].onEachFeature
                                            }).addTo(this.__control__[i].__featureLayer__);

                                        }
                                        else {
                                            dc = L.geoJson(dadosCamada[k], {
                                                onEachFeature: this.__control__[i].onEachFeature
                                            }).addTo(this.__control__[i].__featureLayer__);
                                        }
                                    } else {



                                        if (dadosCamada[k].geometry.type == "Point") {
                                            dc = L.geoJson(dadosCamada[k], {
                                                pointToLayer: function (feature, latlng) {

                                                    if (dadosCamada[k].properties.style.iconUrl == "circle") {

                                                        style = { color: dadosCamada[k].properties.color, weight: 0, opacity: 1, fillColor: dadosCamada[k].properties.color, fillOpacity: 1 }
                                                        raio = 2 * (JSON.parse(dadosCamada[k].properties.iconSize))[0];

                                                        style = { color: "red", weight: 0, opacity: 1, fillColor: "blue", fillOpacity: 1 }
                                                        raio = 2 * (JSON.parse(dadosCamada[k].properties.iconSize))[0];

                                                        return L.circleMarker(latlng, style).setRadius(10)
                                                    }
                                                    else {

                                                        return L.marker(latlng, { icon: L.icon(dadosCamada[k].properties.style) });

                                                    }


                                                },
                                                onEachFeature: this.__control__[i].onEachFeature
                                            }).addTo(this.__control__[i].__featureLayer__);

                                        }
                                        else {
                                            dc = L.geoJson(dadosCamada[k], {
                                                style: dadosCamada[k].properties.style,
                                                onEachFeature: this.__control__[i].onEachFeature
                                            }).addTo(this.__control__[i].__featureLayer__);
                                        }
                                    }
                                }

                                if (typeof this.__control__[i].addToMap == 'undefined' || this.__control__[i].addToMap == true) {
                                    //console.log(" → Add to map")
                                    this.__control__[i].__featureLayer__.addTo(this.__control__[i].map);
                                    this.__control__[i].display = true;
                                }

                                if (this.__control__[i].onDraw) {
                                    //console.log(" → Entrou onDraw")
                                    this.__control__[i].onDraw(this);

                                }

                            } else {
                                console.error("Tipo de camada não reconhecido: '" + this.__control__[i].type + "'. Posição na estrutura de controle:" + i);
                            }

                        }
                    } else {

                        //console.log(" x Out Zoom. "+this.__control__[i].name);


                        if (this.__control__[i].display) {

                            this.__control__[i].__featureLayer__ = this.initLayer(this.__control__[i].map, this.__control__[i].__featureLayer__);
                            this.__control__[i].display = false;

                            if (this.__control__[i].onRemove) {
                                // console.log(" → Entrou onRemove")
                                this.__control__[i].onRemove(this);
                            }
                        }
                    }
                }
                else {
                    console.error("Não existe a entrada 'map' na posição '" + i + "' da estrutura de controle. Nada feito.");
                }
            }
        } else {
            console.error("Não existem dados. Use a função 'loadMap' para adicionar dados. Nada feito.");
        }
    },

    _loadLabel: function () {

        // console.log("_loadData")

        /* Se há dados em controle */
        if (this.__control__) {
            // console.log("Existe controle")

            /* le as entradas do controle */
            for (var i = 0; i < this.__control__.length; i++) {

                /* Se existe um mapa definido dentro do controle, continua */
                if (this.__control__[i].label) {

                    /* Avaliação do zoom */
                    if ((!this.__control__[i].label.minZoom || !this.__control__[i].label.maxZoom) ||
                        ((this.__control__[i].map.getZoom() >= this.__control__[i].label.minZoom) &&
                            (this.__control__[i].map.getZoom() <= this.__control__[i].label.maxZoom))) {
                        // console.log(" → Zoom ok. Vai pintar.")


                        /* Se não está no mapa */
                        if (!this.__control__[i].label.display) {


                            /* Se é "thorJson*/
                            if (this.__control__[i].type == "thorJson") {

                                // console.log(" → É thorJson")

                                /* Cria um featureLayer para essa camada */
                                this.__control__[i].__labelLayer__ = this.initLayer(this.__control__[i].map, this.__control__[i].__labelLayer__);


                                numDf = this.__control__[i].df;
                                numAndar = this.__control__[i].gr;

                                umDf = this.__control__[i].data[numDf];
                                dadosDf = umDf["features"];
                                umAndar = dadosDf[numAndar];
                                dadosAndar = umAndar["features"];

                                for (var j = dadosAndar.length - 1; j >= 0; j--) {
                                    umaCamada = dadosAndar[j];
                                    dadosCamada = umaCamada["features"];
                                    pUmaCamada = umaCamada["properties"];

                                    for (var k = 0; k < dadosCamada.length; k++) {

                                        classe = this.__control__[i].label.className;
                                        campo = this.__control__[i].label.field;

                                        /* Dado do tipo ponto */
                                        if (dadosCamada[k].geometry.type == "Point") {



                                            /* Add label */
                                            dc = L.geoJson(dadosCamada[k], {
                                                pointToLayer: function (feature, latlng) {
                                                    return L.marker(latlng, { icon: L.divIcon({ className: classe, html: dadosCamada[k]["properties"][campo] }) });
                                                },
                                                onEachFeature: this.__control__[i].onEachFeature
                                            }).addTo(this.__control__[i].__labelLayer__);
                                        }
                                        else {
                                            if (typeof dadosCamada[i]["properties"][campo] != 'undefined') {
                                                dc = L.geoJson(dadosCamada[k], {
                                                    style: pUmaCamada["properties"],
                                                    onEachFeature: this.__control__[i].onEachFeature
                                                });

                                                latt = (dc.getBounds()._southWest.lat + dc.getBounds()._northEast.lat) / 2;
                                                lonn = (dc.getBounds()._southWest.lng + dc.getBounds()._northEast.lng) / 2;

                                                L.marker([latt, lonn], { icon: L.divIcon({ className: classe, html: dadosCamada[k]["properties"][campo] }) }).addTo(this.__control__[i].__labelLayer__);
                                            }
                                        }
                                    }
                                }

                                /* Se addToMap é true ou indefinido */
                                //if (typeof this.__control__[i].addToMap == 'undefined' || this.__control__[i].addToMap == true) {
                                // console.log(" → Add to map")

                                this.__control__[i].__labelLayer__.addTo(this.__control__[i].map);
                                this.__control__[i].label.display = true;
                                //}

                                //if (this.__control__[i].onDraw) {
                                // console.log(" → Entrou onDraw")
                                // this.__control__[i].onDraw(this);
                                //}


                            }
                            /* Se é "geojson"*/
                            else if (this.__control__[i].type == "geoJson") {

                                // console.log(" → É geoJson")


                                this.__control__[i].__labelLayer__ = this.initLayer(this.__control__[i].map, this.__control__[i].__labelLayer__)

                                umaCamada = this.__control__[i].data;
                                dadosCamada = umaCamada["features"];
                                pUmaCamada = { properties: { iconUrl: "circle" } }


                                for (var k = 0; k < dadosCamada.length; k++) {

                                    classe = this.__control__[i].label.className;
                                    campo = this.__control__[i].label.field;

                                    /* Dado do tipo ponto */
                                    if (dadosCamada[k].geometry.type == "Point") {



                                        /* Add label */
                                        dc = L.geoJson(dadosCamada[k], {
                                            pointToLayer: function (feature, latlng) {
                                                return L.marker(latlng, { icon: L.divIcon({ className: classe, html: dadosCamada[k]["properties"][campo] }) });
                                            },
                                            onEachFeature: this.__control__[i].onEachFeature
                                        }).addTo(this.__control__[i].__labelLayer__);
                                    }
                                    else {
                                        if (typeof dadosCamada[i]["properties"][campo] != 'undefined') {
                                            dc = L.geoJson(dadosCamada[k], {
                                                style: pUmaCamada["properties"],
                                                onEachFeature: this.__control__[i].onEachFeature
                                            });

                                            latt = (dc.getBounds()._southWest.lat + dc.getBounds()._northEast.lat) / 2;
                                            lonn = (dc.getBounds()._southWest.lng + dc.getBounds()._northEast.lng) / 2;

                                            L.marker([latt, lonn], { icon: L.divIcon({ className: classe, html: dadosCamada[k]["properties"][campo] }) }).addTo(this.__control__[i].__labelLayer__);
                                        }
                                    }
                                }

                                // if (typeof this.__control__[i].addToMap == 'undefined' || this.__control__[i].addToMap == true) {
                                // console.log(" → Add to map")
                                this.__control__[i].__labelLayer__.addTo(this.__control__[i].map);
                                this.__control__[i].label.display = true;
                                // }

                                //if (this.__control__[i].onDraw) {
                                // console.log(" → Entrou onDraw")
                                //this.__control__[i].onDraw(this);
                                //}

                            } else {
                                console.error("Tipo de camada não reconhecido: '" + this.__control__[i].type + "'. Posição na estrutura de controle:" + i);
                            }

                        }
                    } else {

                        //console.log(" x Out Zoom. "+this.__control__[i].name);


                        if (this.__control__[i].label.display) {

                            this.__control__[i].__labelLayer__ = this.initLayer(this.__control__[i].map, this.__control__[i].__labelLayer__);
                            this.__control__[i].label.display = false;

                            //if(this.__control__[i].onRemove)
                            //{
                            // console.log(" → Entrou onRemove")
                            //    this.__control__[i].onRemove(this);
                            // }
                        }
                    }
                }
            }
        }
    },

    initLayer: function (mapp, layerf) {

        //// console.log("                 Entrou initLayer");

        if (layerf) {

            // console.log(" → limpou layer")
            mapp.removeLayer(layerf);
            layerf = null;
            layerf = L.featureGroup();

        }
        else {

            // console.log(" → criou layer")
            layerf = L.featureGroup();

        }

        return layerf;
    },

    refreshMap: function () {
        this._loadData();
        this._loadLabel();
    },

    clearAll: function () {

        for (var i = 0; i < this.__control__.length; i++) {

            if (this.__control__[i].__featureLayer__ && this.__control__[i].map) {

                this.__control__[i].map.removeLayer(this.__control__[i].__featureLayer__);

            }
            if (this.__control__[i].__labelLayer__ && this.__control__[i].map) {

                this.__control__[i].map.removeLayer(this.__control__[i].__labelLayer__);

            }
            
        }

        __control__ = null;
    },

    changeAllGr: function (newGr) {

        for (var i = 0; i < this.__control__.length; i++) {

            if (typeof this.__control__[i].gr != 'undefined') {

                this.__control__[i].gr = newGr;
                this.__control__[i].display = false;

                if (this.__control__[i].label) {
                    this.__control__[i].label.display = false;
                }



            }
        }

        this.refreshMap();

    },

    search: function (termo, campo) {

        

        /* Realiza a busca */
        result = [];
        for (var s = 0; s < this.__control__.length; s++) {

            if (typeof this.__control__[s].search == 'undefined' || this.__control__[s].search != false) {

                dados = this.__control__[s].data;

                
                if (this.__control__[s].type == "thorJson") {

                    termo = this.simplify(termo);

                    for (var y = 0; y < dados.length; y++) {

                        umDf = dados[y];
                        dadosDf = umDf["features"];

                        for (var j = 0; j < dadosDf.length; j++) {
                            umAndar = dadosDf[j];
                            dadosAndar = umAndar["features"];

                            for (var k = dadosAndar.length - 1; k >= 0; k--) {
                                umaCamada = dadosAndar[k];
                                dadosCamada = umaCamada["features"];
                                pUmaCamada = umaCamada["properties"];

                                for (var l = 0; l < dadosCamada.length; l++) {

                                    encontrou = false;
                                    elemento = dadosCamada[l].properties;
                                    listaDeTermos = Object.keys(elemento);
                                    field = false;
                                    termoBusca = "";
                                   

                                    for (var m = 0; m < listaDeTermos.length; m++) {

                                        if (elemento[listaDeTermos[m]] != "") {
                                            termoBusca += elemento[listaDeTermos[m]] + " ";
                                        }
                                        if (typeof campo != 'undefined' && listaDeTermos[m] == campo) {
                                            field = true;
                                        }

                                    }


                                    encontrou = this.find(termo, termoBusca);

                                  

                                    if (encontrou) {
                                        result.push({
                                            "i": s,
                                            "j": y,
                                            "gr": j,
                                            "data": dadosCamada[l]
                                        });

                                    }
                                }
                            }
                        }
                    }
                    //return result;




                } else if (this.__control__[s].type == "geoJson") {

                    console.log("é geojson");

                    //for (var k = dadosAndar.length - 1; k >= 0; k--) {

                    umaCamada = this.__control__[s].data;
                    dadosCamada = umaCamada["features"];
                    pUmaCamada = umaCamada["properties"];

                    for (var l = 0; l < dadosCamada.length; l++) {

                        encontrou = false;
                        elemento = dadosCamada[l].properties;
                        listaDeTermos = Object.keys(elemento);
                        field = false;
                        termoBusca = "";

                        for (var m = 0; m < listaDeTermos.length; m++) {

                            if (elemento[listaDeTermos[m]] != "") {
                                termoBusca += elemento[listaDeTermos[m]] + "|";
                            }
                        }

                        encontrou = this.find(termo, termoBusca);

                        if (encontrou) {

                            result.push({
                                  "i": s,
                                  "data": dadosCamada[l]
                            });

                        }
                    }
                    //}
                }

            }
        }
        return result;
    },

    find: function (termo, termoBusca) {

        termo = this.simplify(termo);
        termoBusca = this.simplify(termoBusca);

        //termo = termo.replace(/[-_/\!@#$%&*]/,".");
        termo = termo.split(" ");
        txt   = "";
        tam = termo.length;
        for (var i = 0; i < tam; i++) {

            // if (i < tam-1) {

            //     txt += "(?=.*"+termo[i]+")|";  
            // }
            // else {
                txt += "(?=.*"+termo[i]+")";
            // }
          
        }

        re = new RegExp(txt, "i");

        if (termoBusca.search(re) > -1) {

             return true;
            
        } else {

             return false;
             
        }
        

    },

    simplify: function (string) {
        /* Simplifica uma string, removendo:
         * - acentos
         * - Maiúsculas
         * - pontuação
         * 
         * Retorna string minúsculas
         * "Laboratório" -> "laboratorio"
         * 
         * Adaptada
         */

        var mapaAcentosHex = {
            a: /[\xE0-\xE6]/g,
            A: /[\xC0-\xC6]/g,
            e: /[\xE8-\xEB]/g,
            E: /[\xC8-\xCB]/g,
            i: /[\xEC-\xEF]/g,
            I: /[\xCC-\xCF]/g,
            o: /[\xF2-\xF6]/g,
            O: /[\xD2-\xD6]/g,
            u: /[\xF9-\xFC]/g,
            U: /[\xD9-\xDC]/g,
            c: /\xE7/g,
            C: /\xC7/g,
            n: /\xF1/g,
            N: /\xD1/g,
        };

        for (var letra in mapaAcentosHex) {
            var expressaoRegular = mapaAcentosHex[letra];
            string = string.replace(expressaoRegular, letra).toLowerCase();
        }

        return string;
    }
}