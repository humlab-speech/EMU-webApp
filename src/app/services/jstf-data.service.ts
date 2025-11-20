import * as angular from 'angular';
import { IJstfParsedData, IJstfFieldValues, IJstfFieldRange } from '../interfaces/jstf-data.interface';

/**
 * Service for storing and querying JSTF data
 * Provides temporal lookup with step function (hold previous slice)
 */
class JstfDataService {
    private data: IJstfParsedData[] = [];
    private ConfigProviderService;

    constructor(ConfigProviderService) {
        this.ConfigProviderService = ConfigProviderService;
    }

    /**
     * Store parsed JSTF data
     * @param jstfData - Array of parsed JSTF data objects
     */
    public setData(jstfData: IJstfParsedData[]): void {
        this.data = jstfData;
    }

    /**
     * Get JSTF file by track name
     * @param trackName - Track name from configuration
     * @returns JSTF data or undefined if not found
     */
    public getFile(trackName: string): IJstfParsedData | undefined {
        const trackConfig = this.ConfigProviderService.getSsffTrackConfig(trackName);
        if (!trackConfig) {
            return undefined;
        }

        // Find by matching file extension
        return this.data.find(jstf => jstf.fileExtension === trackConfig.fileExtension);
    }

    /**
     * Get field value at specific time using step function (hold previous)
     * @param trackName - Track name from configuration
     * @param fieldName - Field name to retrieve
     * @param timeInSeconds - Time in seconds
     * @returns Field value or undefined if no data at that time
     */
    public getFieldValueAtTime(
        trackName: string,
        fieldName: string,
        timeInSeconds: number
    ): number | undefined {
        const jstfFile = this.getFile(trackName);
        if (!jstfFile) {
            return undefined;
        }

        // Find field index
        const fieldIndex = jstfFile.fieldNames.indexOf(fieldName);
        if (fieldIndex === -1) {
            console.warn(`Field '${fieldName}' not found in JSTF file for track '${trackName}'`);
            return undefined;
        }

        // Find slice using binary search
        const sliceIndex = this.findSliceIndexAtTime(jstfFile, timeInSeconds);
        if (sliceIndex === -1) {
            return undefined;
        }

        // Return field value from slice
        return jstfFile.slices[sliceIndex].values[fieldIndex];
    }

    /**
     * Get multiple field values at specific time
     * @param trackName - Track name from configuration
     * @param fieldNames - Array of field names to retrieve
     * @param timeInSeconds - Time in seconds
     * @returns Object mapping field names to values, or undefined if no data at that time
     */
    public getFieldValuesAtTime(
        trackName: string,
        fieldNames: string[],
        timeInSeconds: number
    ): IJstfFieldValues | undefined {
        const jstfFile = this.getFile(trackName);
        if (!jstfFile) {
            return undefined;
        }

        // Find slice
        const sliceIndex = this.findSliceIndexAtTime(jstfFile, timeInSeconds);
        if (sliceIndex === -1) {
            return undefined;
        }

        // Build result object
        const result: IJstfFieldValues = {};
        for (const fieldName of fieldNames) {
            const fieldIndex = jstfFile.fieldNames.indexOf(fieldName);
            if (fieldIndex === -1) {
                console.warn(`Field '${fieldName}' not found in JSTF file for track '${trackName}'`);
                continue;
            }
            result[fieldName] = jstfFile.slices[sliceIndex].values[fieldIndex];
        }

        return Object.keys(result).length > 0 ? result : undefined;
    }

    /**
     * Get min/max values for a field across all slices
     * @param trackName - Track name from configuration
     * @param fieldName - Field name
     * @returns Object with min and max values, or undefined if field not found
     */
    public getFieldMinMax(trackName: string, fieldName: string): IJstfFieldRange | undefined {
        const jstfFile = this.getFile(trackName);
        if (!jstfFile) {
            return undefined;
        }

        // Find field index
        const fieldIndex = jstfFile.fieldNames.indexOf(fieldName);
        if (fieldIndex === -1) {
            console.warn(`Field '${fieldName}' not found in JSTF file for track '${trackName}'`);
            return undefined;
        }

        // Scan all slices for min/max
        let min = Infinity;
        let max = -Infinity;

        for (const slice of jstfFile.slices) {
            const value = slice.values[fieldIndex];
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        }

        return { min, max };
    }

    /**
     * Find slice index containing the given time using step function
     * Returns the slice where begin_time <= time < end_time
     * @param jstfFile - JSTF data to search
     * @param timeInSeconds - Time to search for
     * @returns Slice index or -1 if no slice contains this time
     */
    private findSliceIndexAtTime(jstfFile: IJstfParsedData, timeInSeconds: number): number {
        // Binary search using time index
        let left = 0;
        let right = jstfFile.slices.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const slice = jstfFile.slices[mid];

            if (timeInSeconds >= slice.begin_time && timeInSeconds < slice.end_time) {
                // Found containing slice
                return mid;
            } else if (timeInSeconds < slice.begin_time) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        // No slice contains this time
        return -1;
    }

    /**
     * Get all available field names for a track
     * @param trackName - Track name from configuration
     * @returns Array of field names or undefined if track not found
     */
    public getFieldNames(trackName: string): string[] | undefined {
        const jstfFile = this.getFile(trackName);
        return jstfFile ? jstfFile.fieldNames : undefined;
    }

    /**
     * Clear all stored JSTF data
     */
    public clear(): void {
        this.data = [];
    }
}

angular.module('emuwebApp')
    .service('JstfDataService', JstfDataService);
