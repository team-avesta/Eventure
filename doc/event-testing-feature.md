# Matomo Event Testing Feature

## Overview

A feature to verify if the Matomo events configured in your website's code match exactly with the events mapped in Eventure. This is a code comparison tool - it does not interact with Matomo's API or tracking system.

## Core Functionality

- Read Matomo event configurations from your website's source code
- Compare configured events with events mapped in Eventure
- Show matches and mismatches
- Generate comparison report

## Event Detection Methods

### 1. Network Request Monitoring

- Tool opens your website in a test environment
- Monitors all network requests to Matomo
- Captures actual event data being sent to Matomo
- Verifies if events are actually being tracked

### 2. Matomo Debug Mode

- Enables Matomo debug mode on the page
- Captures all Matomo tracking calls
- Shows detailed tracking information
- Example debug output:
  ```javascript
  // Matomo Debug Output
  [Matomo] Track event: {
    category: "Downloads",
    action: "Click",
    name: "Price List",
    value: null
  }
  ```

### 3. Event Simulation

1. Tool simulates user actions (clicks, form submits, etc.)
2. Waits for Matomo tracking requests
3. Captures the actual data sent to Matomo
4. Compares with expected event configuration

### 4. Event Verification Process

1. **Initial Scan**

   - Check if Matomo is properly initialized
   - Verify tracking code is present
   - Check if debug mode is available

2. **Event Testing**

   - Simulate each mapped event
   - Monitor network requests
   - Capture Matomo debug output
   - Record actual tracking data

3. **Data Comparison**

   ```json
   {
     "eventId": "download_button",
     "verification": {
       "trackingImplemented": true,
       "trackingFires": true,
       "debugOutput": {
         "category": "Downloads",
         "action": "Click",
         "name": "Price List"
       },
       "networkRequest": {
         "url": "matomo.your-site.com/matomo.php",
         "method": "POST",
         "params": {
           "e_c": "Downloads",
           "e_a": "Click",
           "e_n": "Price List"
         }
       }
     }
   }
   ```

4. **Verification Results**
   - ✅ Event tracking code exists
   - ✅ Event fires on action
   - ✅ Correct data sent to Matomo
   - ❌ Missing parameters
   - ❌ Wrong event configuration

## Event Matching Verification

### 1. Event Identification Methods

1. **By Event Properties**

   ```javascript
   // Mapped in Eventure
   {
     "category": "Downloads",
     "action": "Click",
     "name": "Price List"
   }

   // Found in site's Matomo tracking
   [
     {
       "category": "Downloads",  // ✅ Matches
       "action": "Click",       // ✅ Matches
       "name": "Price List"     // ✅ Matches
     },
     {
       "category": "Downloads",  // ✅ Matches
       "action": "Click",       // ✅ Matches
       "name": "Brochure"       // ❌ Different event
     }
   ]
   ```

2. **By Context**

   ```javascript
   // Mapped Event Context
   {
     "page": "/downloads",
     "section": "price-list-section",
     "elementType": "button",
     "nearbyText": "Download Price List"
   }

   // Site Event Context
   {
     "currentPage": "/downloads",         // ✅ Matches
     "parentSection": "price-list-section", // ✅ Matches
     "element": "button",                  // ✅ Matches
     "buttonText": "Download Price List"   // ✅ Matches
   }
   ```

### 2. Matching Algorithm

1. **Exact Match Check**

   - All event properties must match exactly
   - Case-sensitive comparison
   - No partial matches accepted

2. **Context Validation**

   - Verify page URL matches
   - Check surrounding elements
   - Validate element type and content

3. **Uniqueness Verification**
   ```javascript
   // Example: Multiple similar events
   {
     "mappedEvent": {
       "category": "Forms",
       "action": "Submit",
       "name": "Contact Form"
     },
     "foundEvents": [
       {
         "event": {
           "category": "Forms",
           "action": "Submit",
           "name": "Contact Form"
         },
         "context": {
           "page": "/contact",
           "form": "#contact-form"
         }
       },
       {
         "event": {
           "category": "Forms",
           "action": "Submit",
           "name": "Contact Form"
         },
         "context": {
           "page": "/support",
           "form": "#support-form"
         }
       }
     ],
     "resolution": {
       "status": "AMBIGUOUS",
       "message": "Multiple matching events found",
       "requiresContext": true
     }
   }
   ```

### 3. Mismatch Detection

1. **Wrong Event Captured**

   ```javascript
   {
     "mapped": {
       "category": "Downloads",
       "action": "Click",
       "name": "Price List"
     },
     "captured": {
       "category": "Downloads",
       "action": "Click",
       "name": "Brochure",
       "error": "Wrong event captured: Different name parameter"
     }
   }
   ```

2. **Similar Event Warning**
   ```javascript
   {
     "warning": "Similar events found",
     "mapped": {
       "category": "Downloads",
       "action": "Click",
       "name": "Price List"
     },
     "similarEvents": [
       {
         "event": {
           "category": "Downloads",
           "action": "Click",
           "name": "Price List 2023"
         },
         "similarity": "90%"
       }
     ]
   }
   ```

## How It Works

### 1. Code Reading Process

1. User provides website URL
2. Tool reads the page's source code
3. Finds all Matomo event tracking code snippets
4. Extracts event configurations (category, action, name, value)

### 2. Event Comparison

For each mapped event in Eventure, tool:

1. Searches website code for matching event configuration
2. Compares parameters:

   ```javascript
   // Event mapped in Eventure
   {
     "category": "Downloads",
     "action": "Click",
     "name": "Price List"
   }

   // Found in website code
   _paq.push(['trackEvent', 'Downloads', 'Click', 'Price List']);
   ```

### 3. Results

Tool shows:

- Which mapped events exist in code
- Which mapped events are missing
- Any parameter mismatches
- Suggestions for fixes

## Example Results

### 1. Event Found

```javascript
{
  "status": "FOUND",
  "mapped": {
    "category": "Downloads",
    "action": "Click",
    "name": "Price List"
  },
  "inCode": {
    "line": 125,
    "code": "_paq.push(['trackEvent', 'Downloads', 'Click', 'Price List'])",
    "matches": true
  }
}
```

### 2. Event Missing

```javascript
{
  "status": "NOT_FOUND",
  "mapped": {
    "category": "Forms",
    "action": "Submit",
    "name": "Contact Form"
  },
  "suggestion": "No matching event configuration found in code"
}
```

### 3. Parameter Mismatch

```javascript
{
  "status": "MISMATCH",
  "mapped": {
    "category": "Downloads",
    "action": "Click",
    "name": "Price List"
  },
  "inCode": {
    "line": 130,
    "code": "_paq.push(['trackEvent', 'Download', 'Click', 'Price List'])",
    "mismatch": {
      "parameter": "category",
      "expected": "Downloads",
      "found": "Download"
    }
  }
}
```

## Implementation Requirements

### Frontend

1. Add "Test Events" button to screenshot view
2. Show comparison results:
   - ✅ Found and matching
   - ❌ Not found
   - ⚠️ Found but mismatched

### Backend

1. Code parsing service
2. Event comparison logic
3. Results formatting

## Error Cases

1. Page not accessible
2. No Matomo code found
3. Invalid event configuration
4. Syntax errors in code

## Future Enhancements

1. Batch page checking
2. Code suggestions for missing events
3. Export comparison report
4. Automated periodic checks
