#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

static UIColor *PikuhrColor(unsigned int hex) {
  return [UIColor colorWithRed:((hex >> 16) & 255) / 255.0 green:((hex >> 8) & 255) / 255.0 blue:(hex & 255) / 255.0 alpha:1];
}

@interface PikuhrDevice : NSObject <RCTBridgeModule, UIDocumentPickerDelegate>
@property(nonatomic, copy) RCTPromiseResolveBlock pendingResolve;
@property(nonatomic, copy) RCTPromiseRejectBlock pendingReject;
@property(nonatomic, strong) NSURL *pendingURL;
@property(nonatomic, copy) NSString *pendingName;
@end

@implementation PikuhrDevice
RCT_EXPORT_MODULE();
+ (BOOL)requiresMainQueueSetup { return YES; }
- (dispatch_queue_t)methodQueue { return dispatch_get_main_queue(); }

RCT_EXPORT_METHOD(getProfile:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([[NSUserDefaults standardUserDefaults] stringForKey:@"pikuhr_employee_profile"] ?: (id)kCFNull);
}

RCT_EXPORT_METHOD(saveProfile:(NSString *)json resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  id value = [NSJSONSerialization JSONObjectWithData:[json dataUsingEncoding:NSUTF8StringEncoding] options:0 error:&error];
  if (![value isKindOfClass:[NSDictionary class]]) {
    reject(@"PROFILE_SAVE_FAILED", @"The profile could not be saved.", error);
    return;
  }
  [[NSUserDefaults standardUserDefaults] setObject:json forKey:@"pikuhr_employee_profile"];
  resolve(@YES);
}

- (NSData *)pdfDataForReport:(NSDictionary *)report {
  CGRect pageRect = CGRectMake(0, 0, 595, 842);
  UIGraphicsPDFRenderer *renderer = [[UIGraphicsPDFRenderer alloc] initWithBounds:pageRect format:[UIGraphicsPDFRendererFormat new]];
  return [renderer PDFDataWithActions:^(UIGraphicsPDFRendererContext *context) {
    __block CGFloat y = 0;
    __block NSInteger pageNumber = 0;
    void (^drawText)(NSString *, CGRect, CGFloat, BOOL, UIColor *, NSTextAlignment) = ^(NSString *text, CGRect rect, CGFloat size, BOOL bold, UIColor *color, NSTextAlignment alignment) {
      NSMutableParagraphStyle *paragraph = [NSMutableParagraphStyle new];
      paragraph.alignment = alignment;
      [text drawInRect:rect withAttributes:@{NSFontAttributeName: bold ? [UIFont boldSystemFontOfSize:size] : [UIFont systemFontOfSize:size], NSForegroundColorAttributeName: color, NSParagraphStyleAttributeName: paragraph}];
    };
    void (^footer)(void) = ^{
      if (!pageNumber) return;
      drawText(@"Pikuhr | Demo report", CGRectMake(32, 810, 300, 16), 9, NO, UIColor.grayColor, NSTextAlignmentLeft);
      drawText([NSString stringWithFormat:@"Page %ld", (long)pageNumber], CGRectMake(480, 810, 83, 16), 9, NO, UIColor.grayColor, NSTextAlignmentRight);
    };
    void (^beginPage)(void) = ^{
      footer();
      [context beginPage];
      pageNumber++;
      CGContextRef cg = context.CGContext;
      CGColorSpaceRef space = CGColorSpaceCreateDeviceRGB();
      NSArray *gradientColors = @[(id)PikuhrColor(0x4C8AD7).CGColor, (id)PikuhrColor(0x53D7DA).CGColor];
      CGGradientRef gradient = CGGradientCreateWithColors(space, (__bridge CFArrayRef)gradientColors, NULL);
      CGContextSaveGState(cg);
      CGContextClipToRect(cg, CGRectMake(0, 0, 595, 93));
      CGContextDrawLinearGradient(cg, gradient, CGPointZero, CGPointMake(595, 0), 0);
      CGContextRestoreGState(cg);
      CGGradientRelease(gradient);
      CGColorSpaceRelease(space);
      drawText(report[@"title"] ?: @"Report", CGRectMake(32, 18, 530, 32), 24, YES, UIColor.whiteColor, NSTextAlignmentLeft);
      drawText(report[@"subtitle"] ?: @"", CGRectMake(32, 56, 530, 22), 13, NO, UIColor.whiteColor, NSTextAlignmentLeft);
      y = 112;
    };
    void (^ensureSpace)(CGFloat) = ^(CGFloat needed) { if (y + needed > 790) beginPage(); };
    CGFloat (^textHeight)(NSString *, CGFloat, CGFloat, BOOL) = ^CGFloat(NSString *text, CGFloat width, CGFloat size, BOOL bold) {
      CGRect bounds = [text boundingRectWithSize:CGSizeMake(width, CGFLOAT_MAX) options:NSStringDrawingUsesLineFragmentOrigin | NSStringDrawingUsesFontLeading attributes:@{NSFontAttributeName:bold ? [UIFont boldSystemFontOfSize:size] : [UIFont systemFontOfSize:size]} context:nil];
      return ceil(bounds.size.height);
    };
    beginPage();
    NSString *employee = report[@"employee"] ?: @"";
    CGFloat employeeHeight = textHeight(employee, 530, 12, YES);
    drawText(employee, CGRectMake(32, y, 530, employeeHeight + 2), 12, YES, UIColor.darkGrayColor, NSTextAlignmentLeft);
    y += employeeHeight + 22;
    for (NSDictionary *section in report[@"sections"]) {
      ensureSpace(65);
      [PikuhrColor(0x4C8AD7) setFill];
      [[UIBezierPath bezierPathWithRoundedRect:CGRectMake(32, y, 531, 30) cornerRadius:5] fill];
      drawText(section[@"title"] ?: @"", CGRectMake(44, y + 7, 505, 22), 12, YES, UIColor.whiteColor, NSTextAlignmentLeft);
      y += 40;
      for (NSDictionary *row in section[@"rows"]) {
        NSString *label = row[@"label"] ?: @"";
        NSString *value = row[@"value"] ?: @"";
        CGFloat height = MAX(textHeight(label, 300, 11, NO), textHeight(value, 190, 11, YES)) + 14;
        ensureSpace(height);
        drawText(label, CGRectMake(42, y, 300, height), 11, NO, UIColor.darkGrayColor, NSTextAlignmentLeft);
        drawText(value, CGRectMake(361, y, 190, height), 11, YES, UIColor.blackColor, NSTextAlignmentRight);
        y += height;
        [PikuhrColor(0xE6E6E6) setFill];
        UIRectFill(CGRectMake(42, y - 6, 509, 0.5));
      }
      y += 15;
    }
    NSString *note = report[@"note"] ?: @"";
    CGFloat noteHeight = textHeight(note, 530, 9, NO);
    ensureSpace(noteHeight);
    drawText(note, CGRectMake(32, y, 530, noteHeight + 2), 9, NO, UIColor.grayColor, NSTextAlignmentLeft);
    footer();
  }];
}

RCT_EXPORT_METHOD(exportPdf:(NSString *)filename reportJSON:(NSString *)json resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (self.pendingResolve) { reject(@"EXPORT_BUSY", @"Finish the current download first.", nil); return; }
  UIViewController *presenter = RCTPresentedViewController();
  if (!presenter) { reject(@"NO_ACTIVITY", @"Open the app before downloading a PDF.", nil); return; }
  NSError *error;
  NSDictionary *report = [NSJSONSerialization JSONObjectWithData:[json dataUsingEncoding:NSUTF8StringEncoding] options:0 error:&error];
  if (![report isKindOfClass:[NSDictionary class]] || ![report[@"sections"] isKindOfClass:[NSArray class]]) {
    reject(@"EXPORT_FAILED", @"The PDF data is invalid.", error);
    return;
  }
  NSString *safeName = filename.lastPathComponent;
  if (![safeName.lowercaseString hasSuffix:@".pdf"]) safeName = [safeName stringByAppendingString:@".pdf"];
  NSURL *directory = [[NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES] URLByAppendingPathComponent:NSUUID.UUID.UUIDString isDirectory:YES];
  if (![[NSFileManager defaultManager] createDirectoryAtURL:directory withIntermediateDirectories:YES attributes:nil error:&error]) {
    reject(@"EXPORT_FAILED", @"The PDF could not be created.", error); return;
  }
  NSURL *url = [directory URLByAppendingPathComponent:safeName];
  NSData *pdf = [self pdfDataForReport:report];
  if (![pdf writeToURL:url options:NSDataWritingAtomic error:&error]) {
    [[NSFileManager defaultManager] removeItemAtURL:directory error:nil];
    reject(@"EXPORT_FAILED", @"The PDF could not be created.", error); return;
  }
  self.pendingURL = url;
  self.pendingName = safeName;
  self.pendingResolve = resolve;
  self.pendingReject = reject;
  UIDocumentPickerViewController *picker = [[UIDocumentPickerViewController alloc] initForExportingURLs:@[url] asCopy:YES];
  picker.delegate = self;
  [presenter presentViewController:picker animated:YES completion:nil];
}

- (void)finishExport:(BOOL)cancelled urls:(NSArray<NSURL *> *)urls {
  RCTPromiseResolveBlock resolve = self.pendingResolve;
  NSString *name = self.pendingName;
  NSURL *url = self.pendingURL;
  self.pendingResolve = nil;
  self.pendingReject = nil;
  self.pendingURL = nil;
  self.pendingName = nil;
  if (resolve) resolve(cancelled ? @{@"cancelled": @YES} : @{@"cancelled": @NO, @"filename": name ?: @"Report.pdf", @"uri": urls.firstObject.absoluteString ?: @""});
  if (url) [[NSFileManager defaultManager] removeItemAtURL:url.URLByDeletingLastPathComponent error:nil];
}
- (void)documentPickerWasCancelled:(UIDocumentPickerViewController *)controller { [self finishExport:YES urls:@[]]; }
- (void)documentPicker:(UIDocumentPickerViewController *)controller didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls { [self finishExport:NO urls:urls]; }
@end
