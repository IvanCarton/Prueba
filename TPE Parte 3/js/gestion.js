function init() {
    const prodTbody = document.querySelector('#prodTbody');
    const prodForm = document.forms['prodForm'];

    const marcaErrorDiv = document.querySelector('#marca-error');
    const nombreErrorDiv = document.querySelector('#nombre-error');
    const categoriaErrorDiv = document.querySelector('#categoria-error');
    const precioErrorDiv = document.querySelector('#precio-error');
    const inputFiltro = document.querySelector('#filtro');
    const serviceUrl = "https://60d3a5ea61160900173c9882.mockapi.io/api/v1/productos"
    const loader = document.querySelector('.loader');

    const btnAdd = document.querySelector('#btnAdd');
    const btnAddx3 = document.querySelector('#btnAddx3');
    const btnCancelEdit = document.querySelector("#btnCancelEdit");
    const btnConfirmEdit = document.querySelector("#btnConfirmEdit");
    const btnPagAnterior = document.querySelector('#btn-pag-anterior');
    const btnPagSiguiente = document.querySelector("#btn-pag-siguiente")
    const infoPaginas = document.querySelector("#pagina-acutal");

    var prodList = [];
    var paginaActual = 1;
    var itemsTotales = 0;
    var productoAModificar = null;

    obtenerProductos();

    btnAdd.addEventListener('click', async () => {
        if (validateForm()) {
            let debeRenderizar = false;
            debeRenderizar = await procesarCreacion(debeRenderizar);
            procesarRenderizado(debeRenderizar);
        }
    });

    btnAddx3.addEventListener('click', async () => {
        if (validateForm()) {
            let debeRenderizar = false;
            for (let i = 0; i < 3; i++) {
                debeRenderizar = await procesarCreacion(debeRenderizar);
            };
            procesarRenderizado(debeRenderizar);
        }
    });

    btnConfirmEdit.addEventListener("click", () => {
        if (validateForm()) {
            modificarProducto();
        }
    });

    btnCancelEdit.addEventListener("click", cancelarEdicion);

    btnPagSiguiente.addEventListener('click', () => {
        if (paginaActual < getMaxPage()) {
            paginaActual++;
            obtenerProductos();
        }
    });

    btnPagAnterior.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            obtenerProductos();
        }
    });

    inputFiltro.addEventListener('keyup', filtrarProductos);

    /**
    * 
    * @returns
    */
    function validateForm() {
        validarInputValue(prodForm.marca.value, marcaErrorDiv, "marca");
        validarInputValue(prodForm.nombre.value, nombreErrorDiv, "nombre");
        validarInputValue(prodForm.categoria.value, categoriaErrorDiv, "categoría");
        validarInputValueNumeric(prodForm.precio.value, precioErrorDiv, "precio");
        return isFormValid(prodForm.marca.value, prodForm.nombre.value, prodForm.categoria.value, prodForm.precio.value);
    }

    /**
     * 
     * @param inputValue 
     * @param errorDiv 
     * @param campo 
     */
    function validarInputValue(inputValue, errorDiv, campo) {
        if (inputValue.length === 0) {
            errorDiv.innerHTML = "El " + campo + " es requerido."
        } else {
            errorDiv.innerHTML = "";
        }
    }

    /**
     * 
     * @param inputValue 
     * @param errorDiv 
     * @param campo 
     */
    function validarInputValueNumeric(inputValue, errorDiv, campo) {
        if (inputValue.length === 0) {
            errorDiv.innerHTML = "El " + campo + " es requerido."
        } else {
            if (isNaN(inputValue)) {
                errorDiv.innerHTML = "El " + campo + " solo acepta valores numericos."
            } else {
                errorDiv.innerHTML = "";
            }
        }
    }

    /**
     * 
     * @param marcaInputValue 
     * @param nombreInputValue 
     * @param categoriaInputValue 
     * @param precioInputValue 
     * @returns 
     */
    function isFormValid(marcaInputValue, nombreInputValue, categoriaInputValue, precioInputValue) {
        return marcaInputValue.length > 0 &&
            nombreInputValue.length > 0 &&
            categoriaInputValue.length > 0 &&
            (precioInputValue.length > 0 && !isNaN(precioInputValue));
    }

    function filtrarProductos() {
        if (inputFiltro.value) {
            let valorAFiltrar = inputFiltro.value.toLowerCase();
            let listaFiltrada = prodList.filter(prod => {
                return prod.marca.toLowerCase().includes(valorAFiltrar) ||
                    prod.nombre.toLowerCase().includes(valorAFiltrar) ||
                    prod.categoria.toLowerCase().includes(valorAFiltrar) ||
                    prod.precio.toString().toLowerCase().includes(valorAFiltrar);
            });
            renderTable(listaFiltrada);
        } else {
            renderTable(prodList);
        }
    }

    /**
     * 
     * @param debeRenderizar 
     * @returns 
    */
    async function procesarCreacion(debeRenderizar) {
        try {
            let json = await crearProducto();
            if (json) {
                if (prodList.length < 5) {
                    prodList.push(json);
                    debeRenderizar = true;
                }
                itemsTotales++;
            }
        } catch (error) {
            console.error(error);
        }
        return debeRenderizar;
    }


    /**
     * 
     * @param debeRenderizar 
     */
    function procesarRenderizado(debeRenderizar) {
        prodForm.reset();
        if (debeRenderizar) {
            renderTable(prodList);
        }
        configurarPaginacion();
        validarPaginaActual();
    }

    /**
    * 
    * @param listado 
    */
    function renderTable(listado) {
        var aux = "";
        for (let i = 0; i < listado.length; i++) {
            aux += `<tr ${(i % 2 == !0) ? "class=background-color" : ""}>`;
            aux += `<td class="text-center">${listado[i].id}</td>`;
            aux += `<td>${listado[i].marca}</td>`;
            aux += `<td>${listado[i].nombre}</td>`;
            aux += `<td>${listado[i].categoria}</td>`;
            aux += `<td>$${listado[i].precio}</td>`;
            aux += `<td class="text-center"><a class="accion-tabla mr-1" id="eliminar-item_${i}">Eliminar</a>`;
            aux += `<a class="accion-tabla" id="modificar-item_${i}">Editar</a></td>`;
            aux += `</tr>`;
        }
        prodTbody.innerHTML = aux;
        agregarEventosAccionesTabla();
    }

    function agregarEventosAccionesTabla() {
        let accionesTabla = document.querySelectorAll('.accion-tabla');
        accionesTabla.forEach(accion => {
            accion.addEventListener("click", (evento) => {
                procesarAccion(evento.target);
            });
        });
    }

    /**
     * 
     * @param accionSeleccionada 
     */
    function procesarAccion(accionSeleccionada) {
        let idAccion = accionSeleccionada.id;
        if (idAccion !== null) {
            let productoSeleccionado = prodList[idAccion.split("_")[1]];
            if (idAccion.includes("eliminar")) {
                eliminarProducto(productoSeleccionado);
            } else {
                if (idAccion.includes("modificar")) {
                    procesarModificacion(productoSeleccionado);
                }
            }
        }
    }

    /**
     * 
     * @param productoSeleccionado 
     */
    function procesarModificacion(productoSeleccionado) {
        btnConfirmEdit.classList.remove("d-none");
        btnCancelEdit.classList.remove("d-none");
        inputFiltro.classList.add("d-none");
        btnAdd.classList.add("d-none");
        btnAddx3.classList.add("d-none");
        btnPagAnterior.classList.add("disabled");
        btnPagSiguiente.classList.add("disabled");
        document.querySelectorAll(".accion-tabla").forEach(accion => {
            accion.classList.add("disabled");
        });
        prodForm.marca.value = productoSeleccionado.marca;
        prodForm.nombre.value = productoSeleccionado.nombre;
        prodForm.categoria.value = productoSeleccionado.categoria;
        prodForm.precio.value = productoSeleccionado.precio;
        productoAModificar = productoSeleccionado;
    }

    function cancelarEdicion() {
        inputFiltro.classList.remove("d-none");
        btnConfirmEdit.classList.add("d-none");
        btnCancelEdit.classList.add("d-none");
        btnAdd.classList.remove("d-none");
        btnAddx3.classList.remove("d-none");
        btnPagAnterior.classList.remove("disabled");
        btnPagSiguiente.classList.remove("disabled");
        marcaErrorDiv.innerHTML = "";
        nombreErrorDiv.innerHTML = "";
        categoriaErrorDiv.innerHTML = "";
        precioErrorDiv.innerHTML = "";
        document.querySelectorAll(".accion-tabla").forEach(accion => {
            accion.classList.remove("disabled");
        });
        prodForm.reset();
        productoAModificar = null;
    }

    function activarLoader() {
        loader.classList.remove("d-none");
    }

    function desactivarLoader() {
        loader.classList.add("d-none");
    }

    function configurarPaginacion() {
        infoPaginas.innerHTML = paginaActual + ' de ' + getMaxPage();
        if (paginaActual === getMaxPage()) {
            btnPagSiguiente.classList.add("disabled");
        } else {
            btnPagSiguiente.classList.remove("disabled");
        }
        if (paginaActual === 1) {
            btnPagAnterior.classList.add("disabled");
        } else {
            btnPagAnterior.classList.remove("disabled");
        }
    }

    function validarPaginaActual() {
        if (paginaActual < getMaxPage()) {
            paginaActual = getMaxPage();
            obtenerProductos();
        }
    }

    /**
    * 
    * @param pagina 
    */
    function obtenerProductos() {
        let urlObtenerProductos = serviceUrl + "?page=" + paginaActual + "&limit=5";
        inputFiltro.value = "";
        prodTbody.innerHTML = "";
        activarLoader();
        try {
            fetch(urlObtenerProductos).then(response => {
                if (response.ok) {
                    return response.json();
                }
            }).then(json => {
                prodList = json.productos;
                itemsTotales = json.itemsTotales;
                desactivarLoader();
                renderTable(prodList);
                configurarPaginacion();
            });
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 
     * @returns 
     */
    async function crearProducto() {
        const response = await fetch(serviceUrl,
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(getProdForm())
            }
        );
        if (response.ok) {
            return await response.json();
        }
    }

    function modificarProducto() {
        productoAModificar = { ...getProdForm(), "id": productoAModificar.id };
        console.log(productoAModificar);
        let urlModificarProducto = serviceUrl + '/' + Number(productoAModificar.id);
        try {
            fetch(urlModificarProducto, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(productoAModificar)
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
            }).then(json => {
                for (let i = 0; i < prodList.length; i++) {
                    if (json.id === prodList[i].id) {
                        prodList[i] = json;
                    }
                }
                renderTable(prodList);
                cancelarEdicion();
            });
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 
     * @param producto 
     */
    function eliminarProducto(producto) {
        let urlEliminarProducto = serviceUrl + '/' + Number(producto.id);
        try {
            fetch(urlEliminarProducto, {
                method: "DELETE",
                headers: { "content-type": "application/json" }
            }).then(response => {
                if (response.ok) {
                    prodList.splice(prodList.indexOf(producto), 1);
                    itemsTotales--;
                    if (prodList.length === 0) {
                        if (paginaActual > 1) {
                            paginaActual--;
                            obtenerProductos();
                        } else {
                            if (getMaxPage() > 1 || itemsTotales > prodList.length) {
                                obtenerProductos();
                            } else {
                                renderTable(prodList);
                            }
                        }
                    } else {
                        renderTable(prodList);
                    }
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function getProdForm() {
        return {
            "marca": prodForm.marca.value ? prodForm.marca.value : "",
            "nombre": prodForm.nombre.value ? prodForm.nombre.value : "",
            "categoria": prodForm.categoria.value ? prodForm.categoria.value : "",
            "precio": prodForm.precio.value ? prodForm.precio.value : 0
        };
    }

    /**
     * 
     * @returns 
     */
    function getMaxPage() {
        if (itemsTotales !== 0) {
            return Math.ceil(itemsTotales / 5);
        }
        return 1;
    }
}

init();