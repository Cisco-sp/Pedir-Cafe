//declarção de constanates
//chama a xapi
const xapi = require('xapi');
//declara os caminhos basicos de requisição de API
const wxAPIs = {
    //caminho de espaços
    'space': 'https://api.ciscospark.com/v1/rooms',
    //caminho de mensagens
    'message': 'https://api.ciscospark.com/v1/messages'

};
//declara o token de acesso ao bot
const accesstoken = '';
//criação da funcão principal
function Main() {
    //declara o pedido dentro do contexto de contador
    let pedido = [{
        "tipo": "agua",
        "quantidade": 0
    },
    {
        "tipo": "espresso",
        "quantidade": 0
    },
    {
        "tipo": "capu",
        "quantidade": 0
    },
    {
        "tipo": "chá",
        "quantidade": 0
    }
    ];
    //função de checagem de quando algum evento de widget acontece dentro no endpoint
    xapi.event.on('UserInterface Extensions Widget Action', (event) => {
        //switch/case para o evento , checando o nome do botão clicado, e enviando as variaveis corretas para a fução de atualizar pedido
        switch (event.WidgetId) {
            case "water":
                pedido[0] = atualizarPedido(event, pedido[0]);
                break;
            case "express":
                pedido[1] = atualizarPedido(event, pedido[1]);
                break;
            case "capu":
                pedido[2] = atualizarPedido(event, pedido[2]);
                break;
            case "tea":
                pedido[3] = atualizarPedido(event, pedido[3]);
                break;
            //caso o botão clicado for pedir, ele cria a mensagem de pedido e envia ao webex teams.
            case "pedir":
                if (event.Type == 'clicked') {
                    //criação da mensagem
                    let mensagem =
                        'Água(s): ' + pedido[0].quantidade + '\n' +
                        'Espresso(s): ' + pedido[1].quantidade + '\n' +
                        'Cappuccino(s): ' + pedido[2].quantidade + '\n' +
                        'Chá(s): ' + pedido[3].quantidade + ' ';

                    //let letra = mensagem.split(" ");
                    //mensagem = letra.join("\n");

                    //chama a função de enviar a mensagem, e cria a interface gráfica com a parte de confirmação do envio

                    sendWebexTeams(wxAPIs.message, 'Post', " ", mensagem, pedido);
                    //zera o pedido e guarda na variavel "pedido"
                    pedido = zerarVar(pedido);

                }
                break;
        }
    });
    //função de checagem de quando algum evento de painel acontece dentro no endpoint
    xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
        if (event.PanelId == 'panel_3' && event.Type == 'closed')
            //zera o pedido e guarda na variavel
            pedido = zerarVar(pedido);
    });
}
//criação da função de enviar mensagem ao webex teams
function sendWebexTeams(url, method, email, message, pedido) {
    //é importante cercar o comando por um try catch para não crashar os macros
    try {
        //comando de requisição http
        xapi.command('HttpClient ' + method, {
            Header: ["Content-Type: application/json", "Authorization: Bearer " + accesstoken],
            Url: url,
            AllowInsecureHTTPS: 'True'
        },
            JSON.stringify({
                "roomId": email,
                "text": "Segue um pedido fresquinho :D \n" + message
            })
        )
            .then((result) => {
                console.log(message);
                //cria a interface gráfica de confirmação de envio
                console.log(result);
                xapi.command('UserInterface Message Prompt Display', {
                    Title: 'Pedido enviado!',
                    Text: "O seu pedido é de " + message
                });
                //zera e retorna o pedido zerado
                return zerarVar(pedido);
            })
            .catch((err) => {
                //exibe o erro no console caso tenha dado algum
                console.log("failed: " + JSON.stringify(err));
                //exie o mesmo erro na parte visual
                xapi.command('UserInterface Message Prompt Display', {
                    Title: 'Erro:',
                    Text: err
                });
            });
    } catch (exception) {
        console.log("Erro ao enviar a mensagem");
    }
}
//criação de função de atualizar pedido , tanto na parte visual quanto na parte logica
function atualizarPedido(event, pedido) {
    if (event.WidgetId == event.WidgetId && event.Value == 'increment' && event.Type == 'clicked') {
        pedido.quantidade++;
        xapi.command("UserInterface Extensions Widget SetValue", {
            WidgetId: event.WidgetId,
            value: pedido.quantidade
        });
        //console.log(cont);
    } else if (event.WidgetId == event.WidgetId && event.Value == 'decrement' && event.Type == 'clicked') {

        //Condicional para o pedido nunca ser menor que zero
        if (pedido.quantidade > 0) {
            pedido.quantidade--;

        } else {
            pedido.quantidade = 0;
        }

        xapi.command("UserInterface Extensions Widget SetValue", {
            WidgetId: event.WidgetId,
            value: pedido.quantidade
        });

    }
    //Retorna o pedido
    return pedido;
}
//criação d funcção de zerar pedido , tanto na parte visual quanto na parte logica
function zerarVar(pedido) {
    let pedidoZerar = ['water', 'express', 'capu', 'tea'];

    for (let i = 0; i < pedidoZerar.length; i++) {
        pedido[i].quantidade = 0;
        xapi.command("UserInterface Extensions Widget SetValue", {
            WidgetId: pedidoZerar[i],
            value: '0'
        });
    }
    return pedido;
}


//chama a função principal
Main();
