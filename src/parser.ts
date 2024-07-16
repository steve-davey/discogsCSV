import {DiscogsClient} from "@lionralfs/discogs-client";
import {processReleaseData} from "@/components/ProcessReleaseData";
import Papa from "papaparse";

const db = new DiscogsClient().database();

export async function fetchRelease(releaseIds: string[]): Promise<any[] | { error: string }> {
	const processedData = []
	for (const id of releaseIds) {
	  try {
		const {data} = await db.getRelease(id);
		processedData.push(processReleaseData(id, data))
	  } catch (err) {
		console.error('Discogs error', err)
		throw new Error(`Release with ID ${id} does not exist`)
	  }
	}
  
	return processedData
  }

export async function parseCsvToArray(file: File): Promise<string[]> {
	return new Promise((resolve) => {
		Papa.parse<string[]>(file, {
			header: false,
			complete: (results: Papa.ParseResult<any>) => {
				console.log('Parsed: ', results.data);
				resolve(results.data);
			}
		});
	});
}