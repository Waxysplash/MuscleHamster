//
//  Persistence.swift
//  MuscleHamster
//
//  Utilities for safe data persistence with proper error logging
//  Phase: Internal Testing & Polish
//

import Foundation
import OSLog

// MARK: - Persistence Helper

/// Centralized persistence utilities with proper error handling and logging
enum PersistenceHelper {

    // MARK: - Encoding

    /// Safely encode a Codable object to Data with logging
    /// - Parameters:
    ///   - value: The value to encode
    ///   - context: Description of what's being encoded (for logging)
    /// - Returns: Encoded Data or nil if encoding failed
    static func encode<T: Encodable>(_ value: T, context: String) -> Data? {
        do {
            let data = try JSONEncoder().encode(value)
            AppLogger.persistence.debug("Encoded \(context) successfully (\(data.count) bytes)")
            return data
        } catch {
            AppLogger.persistence.failure("Failed to encode \(context)", error: error)
            return nil
        }
    }

    /// Safely decode Data to a Codable type with logging
    /// - Parameters:
    ///   - type: The type to decode to
    ///   - data: The data to decode
    ///   - context: Description of what's being decoded (for logging)
    /// - Returns: Decoded value or nil if decoding failed
    static func decode<T: Decodable>(_ type: T.Type, from data: Data, context: String) -> T? {
        do {
            let value = try JSONDecoder().decode(type, from: data)
            AppLogger.persistence.debug("Decoded \(context) successfully")
            return value
        } catch {
            AppLogger.persistence.failure("Failed to decode \(context)", error: error)
            return nil
        }
    }

    // MARK: - UserDefaults Helpers

    /// Save a Codable value to UserDefaults with logging
    /// - Parameters:
    ///   - value: The value to save
    ///   - key: The UserDefaults key
    ///   - context: Description for logging
    /// - Returns: Whether save was successful
    @discardableResult
    static func save<T: Encodable>(_ value: T, forKey key: String, context: String) -> Bool {
        guard let data = encode(value, context: context) else {
            return false
        }
        UserDefaults.standard.set(data, forKey: key)
        AppLogger.persistence.success("Saved \(context) to UserDefaults", context: key)
        return true
    }

    /// Load a Codable value from UserDefaults with logging
    /// - Parameters:
    ///   - type: The type to decode to
    ///   - key: The UserDefaults key
    ///   - context: Description for logging
    /// - Returns: Decoded value or nil if not found or decoding failed
    static func load<T: Decodable>(_ type: T.Type, forKey key: String, context: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else {
            AppLogger.persistence.debug("No data found for \(context) at key: \(key)")
            return nil
        }
        return decode(type, from: data, context: context)
    }

    /// Remove a value from UserDefaults
    /// - Parameters:
    ///   - key: The UserDefaults key
    ///   - context: Description for logging
    static func remove(forKey key: String, context: String) {
        UserDefaults.standard.removeObject(forKey: key)
        AppLogger.persistence.info("Removed \(context) from UserDefaults at key: \(key)")
    }

    // MARK: - Keychain Helpers (Future)

    /// Placeholder for future keychain storage of sensitive data
    /// Currently not implemented - use for things like auth tokens
}

// MARK: - Convenience Extensions

extension Encodable {
    /// Encode this value to Data with logging
    func encodedData(context: String) -> Data? {
        PersistenceHelper.encode(self, context: context)
    }
}

extension Data {
    /// Decode this data to a Codable type with logging
    func decoded<T: Decodable>(as type: T.Type, context: String) -> T? {
        PersistenceHelper.decode(type, from: self, context: context)
    }
}
