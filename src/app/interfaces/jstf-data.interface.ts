/**
 * TypeScript interfaces for JSTF (JSON-based Signal Track Format) data
 * This format is produced by superassp lst_* functions for sparse,
 * high-dimensional acoustic measures on signal portions.
 */

/**
 * JSTF file structure as produced by superassp
 * Matches the JSON Track Format Specification from superassp package
 */
export interface IJstfFile {
    format: string;           // Always "JSTF"
    version: string;          // Format version (e.g., "1.0")
    created: string;          // ISO 8601 timestamp
    function: string;         // Function that created it (e.g., "lst_vat")
    file_path: string;        // Original audio file path
    sample_rate: number;      // Audio sample rate in Hz
    audio_duration: number;   // Total audio duration in seconds
    metadata: {
        function_version: string;
        parameters: any;
    };
    field_schema: { [fieldName: string]: string };  // field name -> data type mapping
    slices: IJstfSlice[];
}

/**
 * A single time slice in a JSTF file
 * Contains values for all fields in the field_schema
 */
export interface IJstfSlice {
    begin_time: number;       // Start time in seconds
    end_time: number;         // End time in seconds
    values: number[];         // Ordered array matching field_schema order
}

/**
 * Internal parsed representation for efficient lookup
 * Used by JstfDataService for fast temporal queries
 */
export interface IJstfParsedData {
    fileExtension: string;    // File extension (e.g., "vat", "vsj")
    sampleRate: number;       // Audio sample rate
    audioDuration: number;    // Total duration in seconds
    functionName: string;     // Source function name
    fieldNames: string[];     // Ordered list from field_schema keys
    slices: IJstfSlice[];     // Time slices with values
    _timeIndex: number[];     // begin_time values for binary search optimization
}

/**
 * Result of querying field values at a specific time
 */
export interface IJstfFieldValues {
    [fieldName: string]: number;
}

/**
 * Min/max range for a field across all slices
 */
export interface IJstfFieldRange {
    min: number;
    max: number;
}
