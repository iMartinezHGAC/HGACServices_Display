import {jsPDF} from 'jspdf'
import html2canvas from 'html2canvas';

const A4WIDTH = 592.28;
const A4HEIGHT = 841.89;

export default function exportChartToPDF(vectors: HTMLDivElement[]) {
    console.log("called export pdf")
    vectors.forEach(vector =>
      html2canvas(vector, {scale: 3}).then(canvas => {
        const pageHeight = canvas.width / A4WIDTH * A4HEIGHT
        let viewHeight = canvas.height
        // offset to place an image on a new page
        let position = 0
        // image height and width
        const imgHeight = A4WIDTH / canvas.width * canvas.height
        const imgWidth = A4WIDTH; //a4 paper width

        // set image filetype and quality
        const imgData = canvas.toDataURL('image/png', 1.0)
        // set in p (portrait), with data interpreted as points on a screen. Canvas size is A4
        const pdf = new jsPDF('p', 'pt', 'a4')

        // If the total size of the canvas is less than the size of the page
      // then we insert the first image onto the page
        if(viewHeight < pageHeight) {
          pdf.addImage(imgData, 'PNG', 0,0,imgWidth, imgHeight)
      } else { // else we are adding the second, third...Nth page
        while(viewHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0,position,imgWidth, imgHeight)
          viewHeight -= pageHeight
          position -= A4HEIGHT
          // don't add blank pages
          if(viewHeight > 0) {
            pdf.addPage()
          }
        }
      }
      pdf.save("graph.pdf")
      })
    )
  }
