const tmpl =
	() => `diff --git a/node_modules/type-graphql-dataloader/dist/plugins/apollo-server/ApolloServerLoaderPlugin.d.ts b/node_modulestype-graphql-dataloader/dist/plugins/apollo-server/ApolloServerLoaderPlugin.d.ts
index 6bc19cf..b631be5 100644
--- a/node_modules/type-graphql-dataloader/dist/plugins/apollo-server/ApolloServerLoaderPlugin.d.ts
+++ b/node_modules/type-graphql-dataloader/dist/plugins/apollo-server/ApolloServerLoaderPlugin.d.ts
@@ -1,4 +1,4 @@
-import type { ApolloServerPlugin } from "apollo-server-plugin-base";
+import type { ApolloServerPlugin } from "@apollo/server";
 import type { Connection } from "typeorm";
 interface ApolloServerLoaderPluginOption {
     typeormGetConnection?: () => Connection;
diff --git a/node_modules/type-graphql-dataloader/dist/plugins/apollo-server/ApolloServerLoaderPlugin.js b/node_modulestype-graphql-dataloader/dist/plugins/apollo-server/ApolloServerLoaderPlugin.js
index 41093ec..68c6e68 100644
--- a/node_modules/type-graphql-dataloader/dist/plugins/apollo-server/ApolloServerLoaderPlugin.js
+++ b/node_modules/type-graphql-dataloader/dist/plugins/apollo-server/ApolloServerLoaderPlugin.js
@@ -6,7 +6,7 @@ const uuid_1 = require("uuid");
 const ApolloServerLoaderPlugin = (option) => ({
     requestDidStart: async () => ({
         async didResolveSource(requestContext) {
-            Object.assign(requestContext.context, {
+            Object.assign(requestContext.contextValue, {
                 _tgdContext: {
                     requestId: (0, uuid_1.v4)(),
                     typeormGetConnection: option?.typeormGetConnection,
@@ -14,7 +14,7 @@ const ApolloServerLoaderPlugin = (option) => ({
             });
         },
         async willSendResponse(requestContext) {
-            typedi_1.Container.reset(requestContext.context._tgdContext.requestId);
+            typedi_1.Container.reset(requestContext.contextValue._tgdContext.requestId);
         },
     }),
 });
`

export default tmpl
