import supabase from "../SupabaseClient";

/**
 * Sends a WhatsApp notification using Supabase Edge Function
 * @param {string} userName - The name of the user to notify
 * @param {string} message - The message text
 */
export const sendWhatsAppNotification = async (userName, message) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-whatsapp", {
      body: { userName, message },
    });

    if (error) {
      console.error("❌ WhatsApp Service (Edge Function) Error:", error);
    } else {
      console.log(`✅ WhatsApp sent to ${userName} via Edge Function`);
    }
  } catch (error) {
    console.error("🛑 WhatsApp Service Error:", error);
  }
};

/**
 * Sends a WhatsApp template notification using Supabase Edge Function
 * @param {string} userName - The name of the user to notify
 * @param {string} templateName - The name of the WhatsApp template
 * @param {Array<string>} templateArgs - The list of parameters for the template
 */
export const sendWhatsAppTemplate = async (userName, templateName, templateArgs) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-whatsapp", {
      body: { userName, templateName, templateArgs },
    });

    if (error) {
      console.error("❌ WhatsApp Template Service (Edge Function) Error:", error);
    } else {
      console.log(`✅ WhatsApp template "${templateName}" sent to ${userName} via Edge Function`);
    }
  } catch (error) {
    console.error("🛑 WhatsApp Template Service Error:", error);
  }
};

/**
 * Fetches user stats from both checklist and delegation tables and sends a daily task summary
 * Template: Daily Task Summary
 * Recipient: User
 */
export const sendDailyTaskSummary = async (userName) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    // --- CHECKLIST QUERIES ---
    const checklistTotal = supabase
      .from("checklist")
      .select("*", { count: "exact", head: true })
      .eq("name", userName)
      .lte("task_start_date", `${today}T23:59:59`);

    const checklistPending = supabase
      .from("checklist")
      .select("*", { count: "exact", head: true })
      .eq("name", userName)
      .lte("task_start_date", `${today}T23:59:59`)
      .is("submission_date", null);

    const checklistToday = supabase
      .from("checklist")
      .select("*", { count: "exact", head: true })
      .eq("name", userName)
      .gte("task_start_date", `${today}T00:00:00`)
      .lte("task_start_date", `${today}T23:59:59`)
      .is("submission_date", null);

    // --- DELEGATION QUERIES ---
    const delegationTotal = supabase
      .from("delegation")
      .select("*", { count: "exact", head: true })
      .eq("name", userName)
      .lte("task_start_date", `${today}T23:59:59`);

    const delegationPending = supabase
      .from("delegation")
      .select("*", { count: "exact", head: true })
      .eq("name", userName)
      .lte("task_start_date", `${today}T23:59:59`)
      .or("submission_date.is.null,status.eq.extend");

    const delegationToday = supabase
      .from("delegation")
      .select("*", { count: "exact", head: true })
      .eq("name", userName)
      .gte("task_start_date", `${today}T00:00:00`)
      .lte("task_start_date", `${today}T23:59:59`)
      .or("submission_date.is.null,status.eq.extend");

    const [cTotal, cPending, cToday, dTotal, dPending, dToday] =
      await Promise.all([
        checklistTotal,
        checklistPending,
        checklistToday,
        delegationTotal,
        delegationPending,
        delegationToday,
      ]);

    const total = (cTotal.count || 0) + (dTotal.count || 0);
    const pending = (cPending.count || 0) + (dPending.count || 0);
    const todayCount = (cToday.count || 0) + (dToday.count || 0);

    await sendWhatsAppTemplate(userName, "daily_reminder", [
      userName,
      String(total),
      String(todayCount),
      String(pending),
    ]);
  } catch (error) {
    console.error("🛑 Task Summary Error:", error);
  }
};

/**
 * Notifies a user when a new delegation is assigned
 * Template: REMINDER: DELEGATION TASK
 * Recipient: User
 */
export const notifyTaskAssignment = async (userName, task) => {
  const startDate = task.created_at ? new Date(task.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  const deadline = task.task_start_date ? new Date(task.task_start_date).toLocaleDateString() : "N/A";

  await sendWhatsAppTemplate(userName, "new_delegation_task_assign", [
    userName,
    String(task.task_id || "N/A"),
    task.given_by || "N/A",
    task.task_description || "N/A",
    startDate,
    deadline,
  ]);
};

/**
 * Notifies the task allocator (given_by person) when a delegation is extended
 * Template: TASK EXTENSION NOTICE
 * Recipient: The person who allocated the task (task.given_by)
 */
export const notifyTaskExtension = async (userName, task, nextDate) => {
  const allocatorName = task.given_by;

  if (!allocatorName) {
    console.warn(
      "⚠️ notifyTaskExtension: task.given_by is missing, cannot notify allocator.",
    );
    return;
  }

  const templateArgs = [
    String(task.task_id || "N/A"),
    userName,
    task.task_description || "N/A",
    task.given_by || "N/A",
    nextDate,
    task.remarks || task.reason || "No reason provided",
  ];

  try {
    await Promise.all([
      sendWhatsAppTemplate(allocatorName, "extend_task_reminder", templateArgs),
      sendWhatsAppTemplate(userName, "extend_task_reminder", templateArgs),
    ]);
    console.log(
      `✅ Both ${allocatorName} and ${userName} notified of extension (Task ${task.task_id})`,
    );
  } catch (error) {
    console.error("🛑 Extension Notification Error:", error);
  }
};

/**
 * Notifies a user when a new checklist task is assigned
 * Template: new_checklist_task_assign
 * Recipient: User
 */
export const notifyChecklistTaskAssignment = async (userName, task) => {
  const startDate = task.task_start_date 
    ? new Date(task.task_start_date).toLocaleDateString() 
    : new Date().toLocaleDateString();

  await sendWhatsAppTemplate(userName, "new_checklist_task_assign", [
    userName,
    task.given_by || "N/A",
    task.department || "N/A",
    task.task_description || "N/A",
    startDate,
    task.frequency || "N/A",
  ]);
};

