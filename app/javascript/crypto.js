let inversiones = {}; // Declar variables globales
let tasasRetorno = {};
let lSymbols = ['COINBASE_SPOT_BTC_USD', 'COINBASE_SPOT_ETH_USD', 'BINANCE_SPOT_ADA_USDT'];
document.addEventListener('DOMContentLoaded', async function () {
    const fromCurrency = 'USD'; // Moneda de origen (dólares en este caso)
    const toCurrency = 'MXN'; // Moneda de destino (pesos argentinos en este caso)

    // Realiza la solicitud a la API
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
    exchangeRate = 0;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Obtén la tasa de cambio
            exchangeRate = data.rates[toCurrency];

            console.log(exchangeRate);

        })
        .catch(error => console.error('Error al obtener tasas de cambio:', error));

    const socket = new WebSocket('wss://ws.coinapi.io/v1/');


    // Creamos un objeto para almacenar referencias a las filas de la tabla
    const coinRows = {};
    const valores = await obtenerDatosCSV();

    // Inicializamos las referencias a las filas
    lSymbols.forEach(symbol => {
        const coinSymbol = symbol.split('_')[2]; // Obtener solo el tercer elemento
        coinRows[coinSymbol] = document.querySelector(`tr[data-coin="${coinSymbol}"]`);
    });

    socket.addEventListener('open', function (event) {
        console.log('Conexión abierta');
        const subscriptionMsg = {
            type: 'hello',
            apikey: '5EE23C09-8502-4970-B6DC-D64509A2CB3A',
            heartbeat: false,
            subscribe_data_type: ['trade'],
            subscribe_filter_symbol_id: lSymbols
        };
        socket.send(JSON.stringify(subscriptionMsg));
        console.log('Petición WebSocket realizada con éxito');
    });

    socket.addEventListener('message', function (event) {
        handleWebSocketMessage(JSON.parse(event.data));
    });

    socket.addEventListener('close', function (event) {
        console.log('Conexión cerrada:', event);
    });

    function handleWebSocketMessage(message) {
        const coinSymbol = message.symbol_id.split('_')[2]; // Obtener solo el tercer elemento
        const coinRow = coinRows[coinSymbol];

        if (coinRow) {
            const priceCell = coinRow.querySelector(`.price-cell-${coinSymbol}`);
            const estimateCell = coinRow.querySelector(`.estimate-cell-${coinSymbol}`);
            const exchangePeso = coinRow.querySelector(`.exchange-cell-${coinSymbol}`);
            if (estimateCell) {
                const resultado = calcularBalanceProyectado(getInversion(coinSymbol), getTasaRetorno(coinSymbol), 12, message.price);
                estimateCell.textContent = resultado.toLocaleString('es-MX')
                exchangePeso.textContent = ((resultado * exchangeRate).toFixed(2));
            }

            if (priceCell) {
                priceCell.textContent = message.price;
            }
        }
    }

    function getInversion(coinSymbol) {
        console.log(inversiones);

        return inversiones[coinSymbol] || 0;
    }

    function getTasaRetorno(coinSymbol) {
        return tasasRetorno[coinSymbol] || 0;
    }

    function calcularBalanceProyectado(inversionDolares, tasaRetornoMensual, meses, tasaCriptoDolares) {
        const cantidadCripto = inversionDolares / tasaCriptoDolares;
        const cantidadCriptoRedondeada = parseFloat(cantidadCripto.toFixed(8));
        const balance = cantidadCriptoRedondeada * Math.pow((1 + tasaRetornoMensual), meses);
        return parseFloat((balance * tasaCriptoDolares).toFixed(2));
    }
});

async function obtenerDatosCSV() {
    try {
        const url = 'assets/origen.csv';
        const response = await fetch(url);
        const data = await response.text();

        // Procesar los datos CSV
        const filas = data.split('\n').map(row => row.split(','));
        const headers = filas[0];

        // Obtener valores de la tabla
        const valores = filas.slice(1).map(row => {
            const fila = {};
            row.forEach((valor, index) => {
                fila[headers[index]] = valor;
            });
            return fila;
        });

        // Crear objeto de inversiones
        lSymbols.forEach((symbol, index) => {
            const coinSymbol = symbol.split('_')[2];
            const balanceIniKey = Object.keys(valores[index]).find(key => key.includes("balance_ini"));
            const balanceIniString = valores[index][balanceIniKey];
            const cleanedBalanceIniString = balanceIniString.trim();
            const balanceIni = parseFloat(cleanedBalanceIniString);

            if (!isNaN(balanceIni)) {
                inversiones[coinSymbol] = balanceIni;
                tasasRetorno[coinSymbol] = valores[index]["Interes_mensual"] / 100
            }
        });

        return valores;
    } catch (error) {
        console.error('Error al obtener los datos CSV:', error);
        return [];
    }
}


