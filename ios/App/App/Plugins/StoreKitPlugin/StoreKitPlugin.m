#import "StoreKitPlugin.h"

@implementation StoreKitPlugin

- (void)echo:(CAPPluginCall *)call {
    NSString *value = call.options[@"value"];
    if (value == nil) {
        value = @"No value";
    }
    [call resolve:@{@"value": value}];
}

@end

