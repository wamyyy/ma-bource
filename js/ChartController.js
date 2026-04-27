class ChartController {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.chart = null;
    this.series = null;
    this.type = 'Line';
    this.range = 'YTD';
  }

  init() {
    if (!this.container) return;
    if (this.chart) {
      this.chart.remove();
    }
    
    const lightText = 'rgba(255, 255, 255, 0.7)';
    const gridColor = 'rgba(255, 255, 255, 0.05)';

    this.chart = window.LightweightCharts.createChart(this.container, {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: lightText,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: window.LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: gridColor,
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: false,
      },
    });

    this._createSeries();
  }

  _createSeries() {
    if (this.series) {
      this.chart.removeSeries(this.series);
    }
    if (this.type === 'Line') {
      this.series = this.chart.addAreaSeries({
        lineColor: '#34d378',
        topColor: 'rgba(52, 211, 120, 0.4)',
        bottomColor: 'rgba(52, 211, 120, 0)',
        lineWidth: 2,
      });
    } else {
      this.series = this.chart.addCandlestickSeries({
        upColor: '#34d378',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#34d378',
        wickDownColor: '#f43f5e',
      });
    }
  }

  renderData(price, change, type, range) {
    this.type = type;
    this.range = range;
    if (!this.chart) this.init();
    else this._createSeries();

    if (!this.chart) return; // if container was missing

    let days = 252;
    if (range === '1W') days = 5;
    else if (range === '1M') days = 21;
    else if (range === 'YTD') days = 100;
    else if (range === '1Y') days = 252;
    else if (range === 'MAX') days = 1000;

    const dataDesc = [];
    let curClose = price;
    let timeStamp = new Date().getTime();
    
    // Add today
    const dateStr = (timestamp) => {
      const d = new Date(timestamp);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    if (type === 'Line') {
      dataDesc.push({ time: dateStr(timeStamp), value: curClose });
    } else {
      dataDesc.push({ 
        time: dateStr(timeStamp), 
        open: curClose - change, 
        high: curClose + Math.abs(change)*2, 
        low: curClose - Math.abs(change)*2, 
        close: curClose 
      });
    }

    // Generate mock backwards
    for (let i = 1; i < days; i++) {
        timeStamp -= 24 * 60 * 60 * 1000;
        const d = new Date(timeStamp);
        if (d.getDay() === 0 || d.getDay() === 6) {
          // Add extra days to account for skipped weekends so we reach the true length
          days++; 
          continue; 
        }
        const timeStr = dateStr(timeStamp);
        
        const varPercent = (Math.random() - 0.49) * 0.04; 
        let prevClose = curClose / (1 + varPercent);
        if (prevClose <= 0) prevClose = 0.01; // prevent negative prices
        
        const open = prevClose + (prevClose * (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, prevClose) * (1 + Math.random() * 0.01);
        const low = Math.min(open, prevClose) * (1 - Math.random() * 0.01);

        if (type === 'Line') {
          dataDesc.push({ time: timeStr, value: prevClose });
        } else {
          dataDesc.push({ time: timeStr, open, high, low, close: prevClose });
        }
        curClose = prevClose;
    }

    const dataAsc = dataDesc.reverse();
    this.series.setData(dataAsc);
    this.chart.timeScale().fitContent();

    // Adjust color for Line mode based on total performance over period
    if (type === 'Line' && dataAsc.length > 1) {
       const isUp = dataAsc[dataAsc.length-1].value >= dataAsc[0].value;
       this.series.applyOptions({
         lineColor: isUp ? '#34d378' : '#f43f5e',
         topColor: isUp ? 'rgba(52, 211, 120, 0.4)' : 'rgba(244, 63, 94, 0.4)',
         bottomColor: isUp ? 'rgba(52, 211, 120, 0)' : 'rgba(244, 63, 94, 0)',
       });
    }
  }

  resize() {
    if (this.chart && this.container) {
      this.chart.applyOptions({
        width: this.container.clientWidth,
        height: this.container.clientHeight,
      });
    }
  }
}
