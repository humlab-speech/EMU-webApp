import * as angular from 'angular';
import { IJstfFile, IJstfParsedData, IJstfSlice } from '../interfaces/jstf-data.interface';

/**
 * Service for parsing JSTF (JSON-based Signal Track Format) files
 * Handles detection and parsing of JSON track files produced by superassp lst_* functions
 */
class JstfParserService {

    /**
     * Detect if data is in JSTF format
     * @param data - String or ArrayBuffer to check
     * @returns true if data appears to be JSTF format
     */
    public isJstfFormat(data: string | ArrayBuffer): boolean {
        try {
            let jsonString: string;

            // Convert ArrayBuffer to string if needed
            if (data instanceof ArrayBuffer) {
                const decoder = new TextDecoder('utf-8');
                jsonString = decoder.decode(data);
            } else {
                jsonString = data;
            }

            // Quick check: must start with { or whitespace + {
            const trimmed = jsonString.trim();
            if (!trimmed.startsWith('{')) {
                return false;
            }

            // Parse and check for JSTF format marker
            const parsed = JSON.parse(jsonString);
            return parsed.format === 'JSTF';

        } catch (e) {
            // Not valid JSON or doesn't match format
            return false;
        }
    }

    /**
     * Parse a JSTF JSON string to internal representation
     * @param jsonString - JSON string containing JSTF data
     * @param fileExtension - File extension (e.g., "vat", "vsj")
     * @returns Parsed JSTF data optimized for temporal lookup
     * @throws Error if JSON is invalid or doesn't match JSTF schema
     */
    public parseJstf(jsonString: string, fileExtension: string): IJstfParsedData {
        try {
            // Parse JSON (type unknown until validated)
            const parsed: unknown = JSON.parse(jsonString);

            // Validate structure (acts as runtime type guard)
            this.validateJstfStructure(parsed);

            // Now safe to cast after validation
            const jstfFile = parsed as IJstfFile;

            // Extract ordered field names from field_schema
            // Note: Relies on modern JavaScript maintaining object key insertion order
            const fieldNames = Object.keys(jstfFile.field_schema);

            // Create time index for efficient binary search
            const timeIndex = jstfFile.slices.map(slice => slice.begin_time);

            // Validate that all slices have correct number of values
            jstfFile.slices.forEach((slice, idx) => {
                if (slice.values.length !== fieldNames.length) {
                    throw new Error(
                        `Slice ${idx} has ${slice.values.length} values but field_schema defines ${fieldNames.length} fields`
                    );
                }
            });

            // Return optimized parsed data
            return {
                fileExtension: fileExtension,
                sampleRate: jstfFile.sample_rate,
                audioDuration: jstfFile.audio_duration,
                functionName: jstfFile.function,
                fieldNames: fieldNames,
                slices: jstfFile.slices,
                _timeIndex: timeIndex
            };

        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            throw new Error(`Failed to parse JSTF file: ${message}`);
        }
    }

    /**
     * Parse array of JSTF files
     * @param files - Array of file objects with data and fileExtension
     * @returns Promise resolving to array of parsed JSTF data
     */
    public asyncParseJstfArr(
        files: Array<{ data: string | ArrayBuffer, fileExtension: string }>
    ): Promise<IJstfParsedData[]> {
        // For now: synchronous parsing (JSON parsing is fast)
        // Future enhancement: could use Web Worker if needed for large files

        return new Promise((resolve, reject) => {
            try {
                const results: IJstfParsedData[] = [];

                for (const file of files) {
                    let jsonString: string;

                    // Convert ArrayBuffer to string if needed
                    if (file.data instanceof ArrayBuffer) {
                        const decoder = new TextDecoder('utf-8');
                        jsonString = decoder.decode(file.data);
                    } else {
                        jsonString = file.data;
                    }

                    const parsed = this.parseJstf(jsonString, file.fileExtension);
                    results.push(parsed);
                }

                resolve(results);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Validate JSTF file structure
     * @param jstfFile - Parsed JSON object to validate
     * @throws Error if validation fails
     */
    private validateJstfStructure(jstfFile: any): void {
        // Check required top-level fields
        const requiredFields = [
            'format', 'version', 'created', 'function',
            'file_path', 'sample_rate', 'audio_duration',
            'metadata', 'field_schema', 'slices'
        ];

        for (const field of requiredFields) {
            if (!(field in jstfFile)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Check format marker
        if (jstfFile.format !== 'JSTF') {
            throw new Error(`Invalid format marker: expected 'JSTF', got '${jstfFile.format}'`);
        }

        // Check version (currently only support 1.0)
        if (jstfFile.version !== '1.0') {
            console.warn(`JSTF version ${jstfFile.version} may not be fully supported. Expected 1.0.`);
        }

        // Check field_schema is object
        if (typeof jstfFile.field_schema !== 'object' || Array.isArray(jstfFile.field_schema)) {
            throw new Error('field_schema must be an object');
        }

        // Check field_schema has at least one field
        if (Object.keys(jstfFile.field_schema).length === 0) {
            throw new Error('field_schema must contain at least one field');
        }

        // Check slices is array
        if (!Array.isArray(jstfFile.slices)) {
            throw new Error('slices must be an array');
        }

        // Validate each slice
        jstfFile.slices.forEach((slice: any, idx: number) => {
            if (typeof slice.begin_time !== 'number') {
                throw new Error(`Slice ${idx}: begin_time must be a number`);
            }
            if (typeof slice.end_time !== 'number') {
                throw new Error(`Slice ${idx}: end_time must be a number`);
            }
            if (slice.begin_time >= slice.end_time) {
                throw new Error(`Slice ${idx}: begin_time (${slice.begin_time}) must be less than end_time (${slice.end_time})`);
            }
            if (!Array.isArray(slice.values)) {
                throw new Error(`Slice ${idx}: values must be an array`);
            }
        });
    }
}

angular.module('emuwebApp')
    .service('JstfParserService', JstfParserService);
