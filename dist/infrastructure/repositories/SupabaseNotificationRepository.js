"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseNotificationRepository = void 0;
const inversify_1 = require("inversify");
const supabaseAdminClient_1 = require("../database/supabaseAdminClient");
const PushToken_1 = require("../../domain/entities/PushToken");
const ExpoPushToken_1 = require("../../domain/valueObjects/ExpoPushToken");
let SupabaseNotificationRepository = class SupabaseNotificationRepository {
    constructor() {
        this.table = "push_tokens";
    }
    async findByToken(token) {
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .select("*")
            .eq("pushToken", token)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        if (!data)
            return null;
        return this.toEntity(data);
    }
    async upsertToken(input) {
        const now = new Date().toISOString();
        // Upsert by unique pushToken. (Ensure DB has a unique index on pushToken.)
        const { data, error } = await supabaseAdminClient_1.supabaseAdminClient
            .from(this.table)
            .upsert({
            userId: input.userId,
            pushToken: input.pushToken,
            deviceType: input.deviceType,
            updatedAt: now,
        }, { onConflict: "pushToken" })
            .select("*")
            .single();
        if (error)
            throw new Error(error.message);
        const token = this.toEntity(data);
        return { saved: true, token };
    }
    toEntity(row) {
        return new PushToken_1.PushToken(row.id, row.userId, new ExpoPushToken_1.ExpoPushToken(row.pushToken), row.deviceType, new Date(row.createdAt), new Date(row.updatedAt));
    }
};
exports.SupabaseNotificationRepository = SupabaseNotificationRepository;
exports.SupabaseNotificationRepository = SupabaseNotificationRepository = __decorate([
    (0, inversify_1.injectable)()
], SupabaseNotificationRepository);
