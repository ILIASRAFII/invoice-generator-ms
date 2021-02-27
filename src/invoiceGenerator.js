import Moment from 'moment'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { SafeCastToString } from './Helpers'

pdfMake.vfs = pdfFonts.pdfMake.vfs

const methodes = {
  DOWNLOAD: 'download',
  VIEW: 'view',
  PRINT: 'print',
  BUFFER: 'buffer'
}
const InvoiceGenerator = (content, destination, method) => {
  if (!method) {
    throw new Error('Method is not defined')
  }
  if (typeof content !== 'object') {
    throw new Error('Content must be an object')
  } else if (typeof destination !== 'string') {
    throw new Error('Destination must be a string')
  } else if (typeof method !== 'string') {
    throw new Error('output Method must be a string')
  }

  let DataItems = content.Items.map((item) => [{ text: item.Description, colSpan: 3 }, '', '', item.PriceExcludingVat])
  let Info = content.BillingAddress
  
  let attributes = {
    size: 'A4',
    title: content.OrderNumber,
    author: 'IR Technology',
    subject: 'Facture',
    creationDate: Moment(content.IssueDate).format('YYYY-MM-DD'),
    footer: `Test Corporation`
  }

  let docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [20, 90, 20, 40],
    footer: {text: attributes.footer, style: 'footer'},
    content: [
      {
        alignment: 'justify',
        columns: [
          {
            width: 180,
            margin: [-20, 20, 80, 0],
            table: {
              widths: ['*', '*'],
              body: [
                [{ text: 'Facture', style: 'label', border: [true, true, false, true] }, { text: content.OrderNumber, style: 'InvoiceNumber', border: [false, true, true, true] }],
                [{ text: 'Date Facturation:', style: 'issueDate', border: [false, false, false, false] }, { text: Moment(content.IssueDate).format('L'), style: 'issueDate', border: [false, false, false, false] }],
                [{ text: 'Méthode  :', style: 'paymentMethod', border: [false, false, false, false] }, { text: content.PaymentMethod, style: 'paymentMethod', border: [false, false, false, false] }]
              ]
            },
            layout: {
              vLineWidth: () => 0.5,
              hLineWidth: () => 0.5,
              hLineColor: '#9E9E9E',
              vLineColor: '#9E9E9E',
              paddingLeft: () => 6,
              paddingTop: () => 6,
              paddingRight: () => 6,
              paddingBottom: () => 6
            }
          }
        ]
      },
      {
        margin: [18, -80, 0, 20],
        table: {
          body: [
            [{ text: 'par IR Technologies', border: [false, false, false, false], bold: true }],
            [{ text: 'Client :', border: [false, false, false, false], bold: true, fontSize: 14, decoration: 'underline', marginTop: 10 }],
            [{
              text: `${content.User.LastName + ' ' + content.User.FirstName}`,
              bold: true,
              fontSize: 12,
              border: [false, false, false, false],
              margin: [0, 0, 0, 0],
              paddingLeft: () => 0,
              paddingTop: () => 0,
              paddingRight: () => 0,
              paddingBottom: () => 0
            }],
            [{
              text: `${SafeCastToString(Info.Company)}\r${SafeCastToString(Info.AddressLine1)}\r${SafeCastToString(Info.AddressLine2)}\r${SafeCastToString(Info.PostalCode)} ${SafeCastToString(Info.City)}\r${SafeCastToString(Info.State)} ${SafeCastToString(Info.Country)}`,
              style: 'UserContactInfo',
              border: [false, false, false, false]
            }],
            [{
              text: `Email: ${SafeCastToString(content.User.Email)}`,
              style: 'UserContactInfo',
              border: [false, false, false, false]
            }],
            [{
              text: `Téléphone : ${SafeCastToString(content.User.Phone)} `,
              style: 'UserContactInfo',
              border: [false, false, false, false]
            }]
          ]
        }
      },
      {
        style: 'pageStyle',
        table: {
          headerRows: 1,
          widths: ['*', '*', 60, 100],
          body: [
            [
              { text: 'Article', style: 'tableHeader', border: [true, true, false, true], colSpan: 2 },
              { text: '', border: [false, true, false, true], style: 'tableHeader' },
              { text: '', border: [false, true, false, false], style: 'tableHeader' },
              { text: `Montant HT (${content.Currency === 'EUR' ? '€' : content.Currency})`, style: 'tableHeader' }],
            ...DataItems,
            [
              { text: '', border: [false, false, false, false] },
              { colSpan: 2, rowSpan: 1, text: 'Total HT', style: 'tableHeader' },
              '',
              parseFloat(content.PriceExcludingVat).toFixed(2)
            ],
            [
              { text: '', border: [false, false, false, false] },
              { colSpan: 2, rowSpan: 1, text: 'Total TVA (20%)', style: 'tableHeader' },
              '',
              parseFloat(content.VatAmount).toFixed(2)
            ],
            [
              { text: '', border: [false, false, false, false] },
              { colSpan: 2, rowSpan: 1, text: `Total TTC (${content.Currency === 'EUR' ? '€' : content.Currency})`, style: 'tableHeader' },
              '',
              parseFloat(content.TotalPrice).toFixed(2) + (content.Currency === 'EUR' ? '€' : content.Currency)]
          ]
        },
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 1.5 : 1
          },
          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 1.5 : 1
          },
          hLineColor: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray'
          },
          vLineColor: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray'
          }
        }
      }

    ],

    styles: {
      tableHeader: {
        fillColor: '#dfe6e9',
        fontSize: 12,
        bold: true
      },
      label: {
        fillColor: '#dfe6e9',
        bold: true,
        fontSize: 16,
        color: '#727272'

      },
      InvoiceNumber: {
        fillColor: '#dfe6e9',
        bold: true,
        fontSize: 12,
        color: '#727272'
      },
      issueDate: {
        fontSize: 10,
        bold: true
      },
      paymentMethod: {
        fontSize: 9
      },
      pageStyle: {
        margin: [15, 15, 15, 15]
      },
      footer: {
        fontSize: 7,
        margin: [60, 0, 60, 0],
        alignment: 'center'
      },
      UserContactInfo: {
        fontSize: 10,
        margin: [0, 0, 0, 0],
        paddingLeft: () => 0,
        paddingTop: () => 0,
        paddingRight: () => 0,
        paddingBottom: () => 0
      }
    }
  }
  switch (method) {
    case methodes.DOWNLOAD:
      pdfMake.createPdf(docDefinition).download(`${destination}.pdf`)
      break
    case methodes.PRINT:
      pdfMake.createPdf(docDefinition).print({
        options: { autoPrint: true }
      }, `${destination}.pdf`)
      break
    case methodes.VIEW:
      pdfMake.createPdf(docDefinition).open({}, window)
      break
    case methodes.BUFFER:
      pdfMake.createPdf(docDefinition).getBase64((e) => e)
      break
    default:
      throw new Error('Method undefined')
  }
}

export default InvoiceGenerator
