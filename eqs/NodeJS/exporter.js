class CsvExporter {

    constructor() {
        this._separator = ';';
    }

    _formatValue(value) {
        value = value.toString();

        if (value.indexOf(this._separator) >= 0) {
            return `"${this._separator.replace("\"", "\"\"")}"`
        }

        return value;
    }

    export(dataSet, stream) {
        const titleStr = dataSet.fields.map(field => this._formatValue(field.name)).join(this._separator);
        stream.write(titleStr)

        dataSet.rows.forEach(row => {
            let rowStr = '\n'
            rowStr += Object.values(row).map(value => this._formatValue(value)).join(this._separator);
            
            stream.write(rowStr);
        });
    }

    contentType() {
        return 'text/csv';
    }

    fileExtension() {
        return 'csv';
    }
}

class ExcelHtmlExporter {

    constructor() {
        this._settings = {
            fontFamily: "Calibri",
            fontSize: 12,
            tableBgColor:  "#ffffff",
            tableBorderColor: "#000000",
            thicknessOfBorder: 1,
            headerBgColor: "navy",
            headerFgColor: "#ffffff",
            headerFontWeight: "bold"
        }
    }

    export(dataSet, stream) {

        stream.write("<!DOCTYPE HTML PUBLIC ''-//W3C//DTD HTML 4.0 Transitional//EN''>\n");
        stream.write("<html>");
        stream.write("<head>");
        stream.write("<meta http-equiv=Content-Type content=\"text/html;charset=utf-8\">\n");
        stream.write("<meta name=ProgId content=Excel.Sheet/>\n");
        stream.write("<meta name=Generator content=\"Microsoft Excel 11\">\n");
        stream.write("<style>\n");
        stream.write("    tr {vertical-align:top;}\n");
        stream.write("    td br, td p, td ul, td ol, td li  {mso-data-placement:same-cell;}\n");

        stream.write("    .eqn-export-result-set {\n");
        stream.write(`        border-color: ${this._settings.tableBorderColor};\n`);
        stream.write(`        background-color: ${this._settings.tableBgColor};\n`);
        stream.write(`        font-size: ${this._settings.fontSize}.0pt;\n`);
        stream.write(`        font-family: ${this._settings.fontFamily};\n`);
        stream.write("        padding: 0;\n");
        stream.write("    }\n");

        stream.write("    .eqn-export-result-set thead tr {\n");
        stream.write(`        color: ${this._settings.HeaderFgColor};\n`);
        stream.write(`        background-color: ${this._settings.headerBgColor};\n`);
        stream.write(`        font-weight: ${this._settings.headerFontWeight};\n`);
        stream.write("    }\n");

        stream.write("</style>\n");
        stream.write("<body>\n");

        stream.write("<table class=\"eqn-export-result-set\" border=\"1\" cellspacing=\"0\">\n");
        stream.write("<thead>\n");
        stream.write("<tr>\n");

        dataSet.fields.forEach(field => {
            stream.write(`<th>${field.name}</th>\n`);
        });

        stream.write("</tr>\n");
        stream.write("</thead>\n");

        stream.write("<tbody>\n");
        dataSet.rows.forEach(row => {
            stream.write("<tr>\n");
            Object.values(row).forEach(value => {
                stream.write(`<td>${value}</td>\n`);
            });
            stream.write("</tr>\n");
        });
        stream.write("</tbody>\n");
        stream.write("</table>\n");

        stream.write("</body>\n");
        stream.write("</html>\n");
    }

    contentType() {
        return 'application/vnd.ms-excel';
    }
  
    fileExtension() {
        return 'xls';
    }
}

module.exports = function (format) {
    if (format === 'csv') 
        return new CsvExporter();

    if (format === 'excel-html')
        return new ExcelHtmlExporter();

    throw new Error('Unknown exporter');
}