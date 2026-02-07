import FitParser from 'fit-file-parser';

export async function parseFitFile(buffer: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
        const parser = new FitParser({
            force: true,
            speedUnit: 'm/s',
            lengthUnit: 'm',
            temperatureUnit: 'celsius',
            elapsedRecordField: true,
            mode: 'cascade',
        });

        parser.parse(buffer as any, (error: any, data: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}
