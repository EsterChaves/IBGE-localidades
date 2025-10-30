const URL_ESTADOS = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
const selectUF = document.getElementById('select-uf');
const municipiosContainer = document.getElementById('municipios-container');
const mensagemAlerta = document.getElementById('mensagem-alerta');

// Classes do Bootstrap para alertas (carregando/erro)
function exibirAlerta(texto, tipo = 'warning') 
{
    mensagemAlerta.style.display = 'block';
    mensagemAlerta.className = `mt-3 alert alert-${tipo} text-center`;
    mensagemAlerta.textContent = texto;
    municipiosContainer.innerHTML = ''; 
}

// Buscar UFs
async function buscarUFs()
 {
    try 
    {
        const response = await fetch(URL_ESTADOS);
        
        if (!response.ok) 
            {
            throw new Error(`Erro de rede: ${response.status}`);
            }
        
        const estados = await response.json();
        estados.sort((a, b) => a.nome.localeCompare(b.nome));

        estados.forEach(estado => 
            {
            const option = document.createElement('option');
            option.value = estado.id; 
            option.textContent = estado.sigla; 
            selectUF.appendChild(option);
            });

    } catch (error) 
    {
        console.error("Erro ao buscar as UFs:", error);
        selectUF.disabled = true; 
        exibirAlerta('Falha ao carregar a lista de estados. Verifique sua conexão.', 'danger');
    }
}

// Preencher/Busacar municícipios
async function buscarMunicipios() 
{
    const ufId = selectUF.value;

    if (!ufId) 
        {
        municipiosContainer.innerHTML = '';
        mensagemAlerta.style.display = 'none';
        return;
         }

    exibirAlerta('Buscando municípios...', 'info');

    const URL_MUNICIPIOS = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios`;

    try 
    {
        const response = await fetch(URL_MUNICIPIOS);
        
        if (!response.ok) 
            {
            throw new Error(`Erro de servidor: ${response.status}`);
            }
        
        const municipios = await response.json();
        
        mensagemAlerta.style.display = 'none';
        municipiosContainer.innerHTML = '';

        if (municipios.length === 0) 
            {
            exibirAlerta('Nenhum município encontrado para este estado.', 'warning');
            return;
            }
        
        // Para 3 colunas 
        const numColunas = 3;
        const totalMunicipios = municipios.length;
        const itensPorColuna = Math.ceil(totalMunicipios / numColunas);
        
        for (let i = 0; i < numColunas; i++) 
            {
            const coluna = document.createElement('div');
            coluna.className = 'municipios-col';
            
            const inicio = i * itensPorColuna;
            const fim = inicio + itensPorColuna;
            const fatiaMunicipios = municipios.slice(inicio, fim);
            
            fatiaMunicipios.forEach(municipio => 
                {
                const p = document.createElement('p');
                p.textContent = municipio.nome; 
                coluna.appendChild(p);
                });
            
            municipiosContainer.appendChild(coluna);
            }

    } catch (error) 
    {
        console.error("Erro ao buscar municípios:", error);
        exibirAlerta('Falha na comunicação com a API do IBGE. Tente novamente.', 'danger');
    }
}


selectUF.addEventListener('change', buscarMunicipios);

buscarUFs();