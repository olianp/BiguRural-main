const mapsController = {
  
  // REQ12: Integrar com Google Maps e calcular métricas de Carona
  async calcularRotaSustentavel(req, res) {
    const { origem, destino, numPassageiros } = req.body;
    
    if (!origem || !destino) {
      return res.status(400).json({ error: 'Origem e destino são obrigatórios.' });
    }

    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origem)}&destinations=${encodeURIComponent(destino)}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" || !data.rows[0].elements[0].distance) {
        return res.status(400).json({ error: 'Não foi possível traçar a rota.' });
      }

      const distanciaText = data.rows[0].elements[0].distance.text;
      const duracao = data.rows[0].elements[0].duration.text;
      
      // Extrai os KMs em formato numérico
      const distanciaEmKm = parseFloat(distanciaText.replace(/[^0-9.]/g, ''));
      
      // Cálculo Estimado de CO2:
      // Um carro de passeio emite em média 120g de CO2 por km. 
      // Ao compartilhar a carona, calculamos o quanto a emissão deixou de ser multiplicada.
      const reducaoDeCo2PorPassageiro = distanciaEmKm * 0.120; // Em KG
      const totalCo2Evitado = reducaoDeCo2PorPassageiro * (numPassageiros || 1);

      res.json({ distancia: distanciaText, duracao, totalCo2EvitadoKg: totalCo2Evitado.toFixed(2) });
    } catch (error) {
      res.status(500).json({ error: 'Erro de comunicação com o Google Maps: ' + error.message });
    }
  }
};

module.exports = mapsController;