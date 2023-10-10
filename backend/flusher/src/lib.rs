mod gcs;
mod local;

use anyhow::Result;
pub use local::{LocalFlusher, LocalFlusherConfig};
pub use gcs::{GcsFlusher, GcsFlusherConfig};
use std::time::Duration;
use tokio::task::JoinHandle;
use tracing::{debug, error, info};

/// A flusher is something that can periodically flush local data to remote storage.
#[async_trait::async_trait]
pub trait FlusherTrait: Send + Sync + 'static {
    /// Flush the data just once.
    async fn flush(&self) -> Result<()>;

    /// Get the interval at which we should flush.
    fn get_interval(&self) -> Duration;

    /// Consume the flusher to create a task in which we periodically flush the data.
    /// This returns a handle for the task. This task should never end.
    fn run(self) -> JoinHandle<()>
    where
        Self: Sized,
    {
        tokio::spawn(async move {
            let mut num_consecutive_failures = 0;
            loop {
                debug!("Flushing data");
                match self.flush().await {
                    Ok(_) => {
                        info!("Flushed data succesfully");
                    },
                    Err(e) => {
                        error!("Failed to flush data: {:?}", e);
                        num_consecutive_failures += 1;
                        if num_consecutive_failures >= 5 {
                            error!(
                                "Failed to flush data too many times ({}), bailing out!",
                                num_consecutive_failures
                            );
                        }
                    },
                }
                tokio::time::sleep(self.get_interval()).await;
            }
        })
        // This ^ task is never meant to end. If it does, we should move past the
        // select_all we use on the tasks and ultimately shut down.
    }
}
