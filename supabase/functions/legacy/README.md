# Legacy Functions

This directory contains functions that are deprecated, experimental, or no longer actively maintained.

## Deprecated Functions

These functions are scheduled for removal or replacement:

### `deno-oic-extractor`
**Status**: Deprecated - Replaced by `oic-extraction-proven`  
**Reason**: Performance issues and reliability problems  
**Migration**: Use `oic-extraction-proven` instead  
**Removal Date**: TBD  

### `test-batch-50`
**Status**: Experimental - May be removed  
**Reason**: Testing function no longer needed in production  
**Migration**: Use dedicated testing environment  

## Experimental Functions

These functions are under development or testing:

### `enhanced-contextual-chat`
**Status**: Experimental  
**Reason**: Advanced features still being validated  
**Stability**: Not production-ready  

## Guidelines for Legacy Functions

1. **Do not use** legacy functions in new development
2. **Migrate away** from deprecated functions as soon as possible
3. **Test thoroughly** when using experimental functions
4. **Document issues** encountered with legacy functions

## Moving Functions to Legacy

When moving a function to legacy:

1. Move the function directory to `supabase/functions/legacy/`
2. Update the main functions README to remove the function
3. Add entry to this legacy README with:
   - Status (deprecated/experimental)
   - Reason for legacy status
   - Migration path or replacement
   - Timeline for removal (if applicable)

## Function Lifecycle

```
Active → Deprecated → Legacy → Removed
         ↑
    Experimental
```

- **Active**: Production-ready, maintained, documented
- **Deprecated**: Still works but scheduled for removal
- **Experimental**: Under development, may be unstable
- **Legacy**: Moved to legacy directory
- **Removed**: Completely removed from codebase